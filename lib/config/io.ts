import type { VaultConfig } from "./types";
import { vaultConfigSchema } from "./schema";

export type ParseResult =
  | { ok: true; config: VaultConfig }
  | { ok: false; error: string };

/**
 * Reconcile the legacy `sync` booleans with the newer `syncStrategy` field for
 * configs saved before `syncStrategy` existed (it defaults to "none" on import).
 * Keeps the UI advisor and generators consistent without crashing old files.
 */
export function normalizeConfig(config: VaultConfig): VaultConfig {
  if (config.syncStrategy === "none") {
    if (config.sync.git) return { ...config, syncStrategy: "git" };
    if (config.sync.icloud) return { ...config, syncStrategy: "icloud" };
  }
  return config;
}

/** Parse and validate a config from JSON text (used by Import). */
export function parseConfigJson(text: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: "Invalid JSON: could not parse the file." };
  }
  const parsed = vaultConfigSchema.safeParse(data);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const path = first?.path.join(".") || "(root)";
    return { ok: false, error: `Invalid config at "${path}": ${first?.message ?? "unknown error"}.` };
  }
  return { ok: true, config: normalizeConfig(parsed.data) };
}

/** Pretty-print a config for Export. */
export function serializeConfig(config: VaultConfig): string {
  return JSON.stringify(config, null, 2);
}

export const CONFIG_EXPORT_FILENAME = "vault-config.json";
