import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { AppRegistryEntry } from "./app-registry";
import { classifyWixEvent, type WixDecodedWebhook } from "./wix";

export type PersistWebhookInput = {
  app: AppRegistryEntry;
  platform: string;
  appKey: string;
  rawBody: string;
  rawHeaders: Record<string, string>;
  wix: WixDecodedWebhook;
};

export async function persistWixWebhook(input: PersistWebhookInput) {
  const supabase = getSupabaseAdmin();
  const classification = classifyWixEvent(input.wix);
  const app = await upsertApp(input.app);
  const appPlatform = await upsertAppPlatform(input.app, app.id);
  const eventLog = await insertEventLog(input, app.id, appPlatform.id, classification);

  if (eventLog.duplicate) {
    return {
      status: "duplicate" as const,
      eventId: eventLog.id,
    };
  }

  try {
    const installation = await upsertInstallation(input, app.id, appPlatform.id, classification);

    if (input.wix.eventType.startsWith("paid_plan") || input.wix.eventType.startsWith("plan_")) {
      await insertBillingEvent(input, app.id, appPlatform.id, installation?.id ?? null, eventLog.id, classification);
    }

    await markEventProcessed(eventLog.id);

    return {
      status: "processed" as const,
      eventId: eventLog.id,
    };
  } catch (error) {
    await markEventFailed(eventLog.id, error instanceof Error ? error.message : "Unknown processing error");
    throw error;
  }
}

async function upsertApp(app: AppRegistryEntry) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("zider_apps")
    .upsert(
      {
        app_key: app.appKey,
        app_name: app.appName,
        app_category: "wix_existing_app",
        status: app.status,
      },
      { onConflict: "app_key" },
    )
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function upsertAppPlatform(app: AppRegistryEntry, appId: string) {
  const supabase = getSupabaseAdmin();
  const { data: existing, error: lookupError } = await supabase
    .from("app_platforms")
    .select("id")
    .eq("app_key", app.appKey)
    .eq("platform", app.platform)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (existing) {
    const updatePayload: Record<string, unknown> = {
      app_id: appId,
      platform_app_name: app.appName,
      status: app.status,
      default_billing_provider: app.billingProvider,
      updated_at: new Date().toISOString(),
    };

    if (app.platformAppId) {
      updatePayload.platform_app_id = app.platformAppId;
    }

    const { data, error } = await supabase
      .from("app_platforms")
      .update(updatePayload)
      .eq("id", existing.id)
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const { data, error } = await supabase
    .from("app_platforms")
    .insert({
      app_id: appId,
      app_key: app.appKey,
      platform: app.platform,
      platform_app_id: app.platformAppId ?? null,
      platform_app_name: app.appName,
      status: app.status,
      default_billing_provider: app.billingProvider,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

type EventClassification = ReturnType<typeof classifyWixEvent>;

async function insertEventLog(
  input: PersistWebhookInput,
  appId: string,
  appPlatformId: string,
  classification: EventClassification,
) {
  const supabase = getSupabaseAdmin();
  const payload = {
    app_id: appId,
    app_key: input.appKey,
    app_platform_id: appPlatformId,
    platform: input.platform,
    instance_id: input.wix.instanceId,
    event_type: input.wix.eventType,
    event_id: input.wix.eventId,
    event_time: input.wix.eventTime,
    dedupe_key: input.wix.dedupeKey,
    raw_body: input.rawBody,
    raw_jwt: input.wix.token,
    raw_headers: input.rawHeaders,
    decoded_payload: input.wix.decodedPayload,
    event_source: classification.eventSource,
    is_test_event: classification.isTestEvent,
    test_reason: classification.testReason,
    verification_status: "verified",
    processing_status: "processing",
  };
  let { data, error } = await supabase
    .from("platform_event_logs")
    .insert(payload)
    .select("id")
    .single();

  if (error && isMissingTestMetadataColumnError(error)) {
    const retry = await supabase
      .from("platform_event_logs")
      .insert(omitTestEventMetadata(payload))
      .select("id")
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (!error && data) {
    return {
      id: data.id as string,
      duplicate: false,
    };
  }

  if (!error) {
    throw new Error("Inserted webhook event did not return an id");
  }

  if (isDuplicateError(error)) {
    const { data: existing, error: lookupError } = await supabase
      .from("platform_event_logs")
      .select("id, processing_status")
      .eq("dedupe_key", input.wix.dedupeKey)
      .single();

    if (lookupError) {
      throw lookupError;
    }

    if (existing.processing_status !== "processed") {
      const { error: updateError } = await supabase
        .from("platform_event_logs")
        .update({
          processing_status: "processing",
          processing_error: null,
        })
        .eq("id", existing.id);

      if (updateError) {
        throw updateError;
      }

      return {
        id: existing.id as string,
        duplicate: false,
      };
    }

    return {
      id: existing.id as string,
      duplicate: true,
    };
  }

  throw error;
}

async function upsertInstallation(
  input: PersistWebhookInput,
  appId: string,
  appPlatformId: string,
  classification: EventClassification,
) {
  if (!input.wix.instanceId) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const eventData = input.wix.eventData;
  const now = new Date().toISOString();
  const status = input.wix.eventType === "app_instance_removed" ? "removed" : "active";
  const installedAt = input.wix.eventType === "app_instance_installed" ? input.wix.eventTime ?? now : null;
  const uninstalledAt = input.wix.eventType === "app_instance_removed" ? input.wix.eventTime ?? now : null;
  const planId = getString(eventData.vendorProductId);

  const { data: existing, error: lookupError } = await supabase
    .from("app_installations")
    .select("id, installed_at")
    .eq("app_key", input.appKey)
    .eq("platform", input.platform)
    .eq("instance_id", input.wix.instanceId)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (existing) {
    const updatePayload: Record<string, unknown> = {
      status,
      billing_provider: input.app.billingProvider,
      event_source: classification.eventSource,
      is_test_install: classification.isTestEvent,
      test_reason: classification.testReason,
      last_event_at: input.wix.eventTime ?? now,
      last_seen_at: now,
      updated_at: now,
    };

    if (planId) {
      updatePayload.current_plan_id = planId;
      updatePayload.current_plan_name = planId;
    }

    if (installedAt && !existing.installed_at) {
      updatePayload.installed_at = installedAt;
    }

    if (uninstalledAt) {
      updatePayload.uninstalled_at = uninstalledAt;
    }

    let { data, error } = await supabase
      .from("app_installations")
      .update(updatePayload)
      .eq("id", existing.id)
      .select("id")
      .single();

    if (error && isMissingTestMetadataColumnError(error)) {
      const retry = await supabase
        .from("app_installations")
        .update(omitTestInstallMetadata(updatePayload))
        .eq("id", existing.id)
        .select("id")
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      throw error;
    }

    return data;
  }

  const payload = {
    app_id: appId,
    app_key: input.appKey,
    app_platform_id: appPlatformId,
    platform: input.platform,
    distribution_channel: input.app.distributionChannel,
    acquisition_source: input.app.acquisitionSource,
    instance_id: input.wix.instanceId,
    external_install_id: getString(eventData.appId),
    status,
    billing_provider: input.app.billingProvider,
    event_source: classification.eventSource,
    is_test_install: classification.isTestEvent,
    test_reason: classification.testReason,
    current_plan_id: planId,
    current_plan_name: planId,
    installed_at: installedAt,
    uninstalled_at: uninstalledAt,
    last_event_at: input.wix.eventTime ?? now,
    first_seen_at: now,
    last_seen_at: now,
  };
  let { data, error } = await supabase
    .from("app_installations")
    .insert(payload)
    .select("id")
    .single();

  if (error && isMissingTestMetadataColumnError(error)) {
    const retry = await supabase
      .from("app_installations")
      .insert(omitTestInstallMetadata(payload))
      .select("id")
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    throw error;
  }

  return data;
}

async function insertBillingEvent(
  input: PersistWebhookInput,
  appId: string,
  appPlatformId: string,
  installationId: string | null,
  eventLogId: string,
  classification: EventClassification,
) {
  const supabase = getSupabaseAdmin();
  const eventData = input.wix.eventData;
  const payload = {
    app_id: appId,
    app_key: input.appKey,
    platform: input.platform,
    app_platform_id: appPlatformId,
    installation_id: installationId,
    instance_id: input.wix.instanceId,
    event_type: input.wix.eventType,
    event_source: classification.eventSource,
    is_test_event: classification.isTestEvent,
    test_reason: classification.testReason,
    billing_provider: input.app.billingProvider,
    vendor_product_id: getString(eventData.vendorProductId),
    previous_vendor_product_id: getString(eventData.previousVendorProductId),
    cycle: getString(eventData.cycle),
    previous_cycle: getString(eventData.previousCycle),
    invoice_id: getString(eventData.invoiceId),
    coupon_name: getString(eventData.couponName),
    operation_timestamp: getTimestampString(eventData.operationTimeStamp) ?? input.wix.eventTime,
    raw_event_id: eventLogId,
  };
  let { error } = await supabase
    .from("app_billing_events")
    .upsert(payload, { onConflict: "raw_event_id" });

  if (error && isMissingTestMetadataColumnError(error)) {
    const retry = await supabase
      .from("app_billing_events")
      .upsert(omitTestEventMetadata(payload), { onConflict: "raw_event_id" });
    error = retry.error;
  }

  if (error) {
    throw error;
  }
}

async function markEventProcessed(eventLogId: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("platform_event_logs")
    .update({
      processing_status: "processed",
      processed_at: new Date().toISOString(),
    })
    .eq("id", eventLogId);

  if (error) {
    throw error;
  }
}

export async function markEventFailed(eventLogId: string, message: string) {
  const supabase = getSupabaseAdmin();
  await supabase
    .from("platform_event_logs")
    .update({
      processing_status: "failed",
      processing_error: message,
      processed_at: new Date().toISOString(),
    })
    .eq("id", eventLogId);
}

function isDuplicateError(error: { code?: string; message?: string }) {
  return error.code === "23505" || Boolean(error.message?.toLowerCase().includes("duplicate"));
}

function isMissingTestMetadataColumnError(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? "";

  return (
    error.code === "42703" ||
    message.includes("event_source") ||
    message.includes("is_test_event") ||
    message.includes("is_test_install") ||
    message.includes("test_reason")
  );
}

function omitTestEventMetadata<T extends Record<string, unknown>>(payload: T) {
  const { event_source: _eventSource, is_test_event: _isTestEvent, test_reason: _testReason, ...rest } = payload;
  return rest;
}

function omitTestInstallMetadata<T extends Record<string, unknown>>(payload: T) {
  const { event_source: _eventSource, is_test_install: _isTestInstall, test_reason: _testReason, ...rest } = payload;
  return rest;
}

function getString(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return null;
}

function getTimestampString(value: unknown) {
  if (typeof value === "string") {
    const numeric = Number(value);

    if (Number.isFinite(numeric) && value.trim() !== "") {
      return timestampFromNumber(numeric);
    }

    return value;
  }

  if (typeof value === "number") {
    return timestampFromNumber(value);
  }

  return null;
}

function timestampFromNumber(value: number) {
  const milliseconds = value > 10_000_000_000 ? value : value * 1000;
  return new Date(milliseconds).toISOString();
}
