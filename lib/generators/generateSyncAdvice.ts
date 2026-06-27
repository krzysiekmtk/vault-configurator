import type { VaultConfig, SyncStrategy } from "../config/types";
import { SYNC_STRATEGY_DEFS, DEVICE_DEFS } from "../config/catalog";

export interface SyncAdvice {
  strategyLabel: string;
  deviceLabels: string[];
  summary: string;
  warnings: string[];
}

const STRATEGY_NOTES: Record<SyncStrategy, { summary: string; warnings: string[] }> = {
  none: {
    summary: "No sync configured. Back up the vault folder manually.",
    warnings: ["Without sync your notes live on one device only. Keep a backup copy."],
  },
  "obsidian-sync": {
    summary: "Obsidian Sync is the simplest reliable option across devices.",
    warnings: ["Obsidian Sync is a paid service. No setup needed beyond signing in."],
  },
  icloud: {
    summary: "iCloud works well across Apple devices.",
    warnings: [
      "Point Obsidian at the iCloud folder yourself.",
      "Multiple devices editing at once can create conflict copies.",
      "Do not combine iCloud and Git on the same vault.",
    ],
  },
  git: {
    summary: "Git is powerful for technical users and gives full history.",
    warnings: [
      "Git is awkward on mobile — expect manual commits or a plugin.",
      "Resolve merge conflicts carefully; never force-push over real edits.",
    ],
  },
  "dropbox-onedrive": {
    summary: "Dropbox or OneDrive can host the vault folder.",
    warnings: [
      "Watch for sync conflicts and leftover temp files.",
      "Let one device finish syncing before editing on another.",
    ],
  },
};

/**
 * Build device + sync-strategy recommendations. Pure and deterministic; shared
 * by the README, CLAUDE.md, the Claude prompt, the UI advisor and Vault Health.
 */
export function generateSyncAdvice(config: VaultConfig): SyncAdvice {
  const strategyLabel =
    SYNC_STRATEGY_DEFS.find((s) => s.key === config.syncStrategy)?.label ?? config.syncStrategy;
  const deviceLabels = config.devices.map(
    (d) => DEVICE_DEFS.find((x) => x.key === d)?.label ?? d,
  );

  const base = STRATEGY_NOTES[config.syncStrategy];
  const warnings = [...base.warnings];

  const mobile = config.devices.some((d) => d === "iphone" || d === "android" || d === "ipad");
  if (mobile && config.syncStrategy === "git") {
    warnings.push("You selected a mobile device with Git — consider Obsidian Sync instead.");
  }
  if (config.devices.includes("work")) {
    warnings.push(
      "Work computer: check company IT policy before syncing. Keep private notes out of work-managed storage.",
    );
  }

  return { strategyLabel, deviceLabels, summary: base.summary, warnings };
}
