import { createHash } from "crypto";

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function createDedupeKey(parts: Array<string | null | undefined>) {
  return sha256(parts.filter(Boolean).join(":"));
}
