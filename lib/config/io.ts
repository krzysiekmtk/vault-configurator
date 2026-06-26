import type { VaultConfig } from "./types";
import { vaultConfigSchema } from "./schema";

export type ParseResult =
  | { ok: true; config: VaultConfig }
  | { ok: false; error: string };

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
  return { ok: true, config: parsed.data };
}

/** Pretty-print a config for Export. */
export function serializeConfig(config: VaultConfig): string {
  return JSON.stringify(config, null, 2);
}

export const CONFIG_EXPORT_FILENAME = "vault-config.json";
