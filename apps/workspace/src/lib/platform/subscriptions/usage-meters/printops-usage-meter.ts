import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function readPrintOpsMonthlyOrderUsage(input: {
  appKey: string;
  instanceId: string;
  periodEnd: string;
  periodStart: string;
  platform: "wix";
}) {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("printops_orders")
    .select("source_order_id", { count: "exact", head: true })
    .eq("app_key", input.appKey)
    .eq("platform", input.platform)
    .eq("instance_id", input.instanceId)
    .gte("source_created_at", input.periodStart)
    .lt("source_created_at", input.periodEnd);

  if (error) {
    return {
      error,
      used: 0,
    };
  }

  return {
    error: null,
    used: count ?? 0,
  };
}
