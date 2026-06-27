import type { VaultConfig } from "../config/types";
import { vaultConfigSchema } from "../config/schema";
import { normalizeConfig } from "../config/io";

/** Base64url encode a UTF-8 string (URL-safe, no padding). */
function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Decode a base64url string back to UTF-8. */
function fromBase64Url(b64: string): string {
  const padded = b64.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

const HASH_PREFIX = "cfg=";

/** Encode a config into a URL hash fragment value (without the leading "#"). */
export function encodeConfigToHash(config: VaultConfig): string {
  return HASH_PREFIX + toBase64Url(JSON.stringify(config));
}

/** Build a full shareable URL for the current location + config. */
export function buildShareUrl(config: VaultConfig, baseUrl: string): string {
  const url = new URL(baseUrl);
  url.hash = encodeConfigToHash(config);
  return url.toString();
}

/**
 * Try to decode a config from a location hash. Returns null on any failure
 * (missing, malformed base64, invalid JSON, or schema mismatch) — callers
 * fall back to localStorage / defaults rather than crashing.
 */
export function decodeConfigFromHash(hash: string): VaultConfig | null {
  try {
    const raw = hash.replace(/^#/, "");
    if (!raw.startsWith(HASH_PREFIX)) return null;
    const json = fromBase64Url(raw.slice(HASH_PREFIX.length));
    const parsed = vaultConfigSchema.safeParse(JSON.parse(json));
    return parsed.success ? normalizeConfig(parsed.data) : null;
  } catch {
    return null;
  }
}
