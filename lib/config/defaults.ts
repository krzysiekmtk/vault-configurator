import type { VaultConfig } from "./types";
import { PROFILE_PRESETS } from "./presets";

/** Default vault name used on first load and after reset. */
export const DEFAULT_VAULT_NAME = "My Vault";

/**
 * Default configuration shown on first visit and restored by "Reset to defaults".
 * Built from the Dev profile so the app showcases a rich, useful setup immediately.
 */
export const DEFAULT_CONFIG: VaultConfig = {
  ...PROFILE_PRESETS.dev,
  profile: "dev",
  vaultName: DEFAULT_VAULT_NAME,
};

/** Deep clone so callers never share references with the frozen default. */
export function freshDefaultConfig(): VaultConfig {
  return structuredClone(DEFAULT_CONFIG);
}
