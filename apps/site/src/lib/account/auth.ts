export const accountSessionCookieName = "zider_account_session";
export const accountSessionMaxAgeSeconds = 60 * 60 * 12;

export function getAccountSessionSecret() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
}

export function isAccountAuthConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function createAccountSessionValue(userId: string, now = Date.now()) {
  const secret = getAccountSessionSecret();

  if (!secret) {
    throw new Error("Supabase service role key is not configured");
  }

  const expiresAt = String(now + accountSessionMaxAgeSeconds * 1000);
  const payload = `${userId}.${expiresAt}`;
  const signature = await signAccountSession(payload, secret);

  return `${payload}.${signature}`;
}

export async function readAccountSessionValue(value: string | null | undefined, now = Date.now()) {
  const secret = getAccountSessionSecret();

  if (!secret || !value) {
    return null;
  }

  const [userId, expiresAt, signature] = value.split(".");
  const expiresAtTime = Number(expiresAt);

  if (!userId || !expiresAt || !signature || !Number.isFinite(expiresAtTime) || expiresAtTime <= now) {
    return null;
  }

  const expectedSignature = await signAccountSession(`${userId}.${expiresAt}`, secret);

  return timingSafeEqual(signature, expectedSignature)
    ? {
        expiresAt: new Date(expiresAtTime).toISOString(),
        userId,
      }
    : null;
}

async function signAccountSession(value: string, secret: string) {
  const cryptoKey = await globalThis.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"],
  );
  const signature = await globalThis.crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(value));

  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;

  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return diff === 0;
}
