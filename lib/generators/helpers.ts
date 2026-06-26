import type { VaultConfig } from "../config/types";
import { FOLDER_PRESET_TREES } from "../config/presets";

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export interface DateParts {
  iso: string; // 2026-06-26
  compact: string; // 20260626
  year: string; // 2026
  monthFolder: string; // 06 - June
}

export function dateParts(date: Date): DateParts {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return {
    iso: `${y}-${pad2(m)}-${pad2(d)}`,
    compact: `${y}${pad2(m)}${pad2(d)}`,
    year: String(y),
    monthFolder: `${pad2(m)} - ${MONTHS[date.getMonth()]}`,
  };
}

/** Resolve the active folder list, cleaning custom input. */
export function resolveFolders(config: VaultConfig): string[] {
  if (config.folderPreset === "custom") {
    return cleanCustomFolders(config.customFolders);
  }
  return [...FOLDER_PRESET_TREES[config.folderPreset]];
}

/** Parse/clean custom folder input (array already split by the UI, or raw strings). */
export function cleanCustomFolders(folders: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of folders) {
    const name = raw.trim().replace(/[\\/]+$/, "").replace(/^[\\/]+/, "");
    if (name && !seen.has(name)) {
      seen.add(name);
      out.push(name);
    }
  }
  return out;
}

/**
 * Apply the configured filename prefix to a base name (without extension).
 * `type` is the note type used by the "type" prefix mode.
 */
export function applyPrefix(
  config: VaultConfig,
  base: string,
  type: string,
  parts: DateParts,
): string {
  switch (config.filePrefix) {
    case "date-dash":
      return `${parts.iso}-${base}`;
    case "date-compact":
      return `${parts.compact}-${base}`;
    case "type":
      return `${type}-${base}`;
    case "none":
    default:
      return base;
  }
}

const FOLDER_MATCHERS = {
  inbox: /inbox/i,
  project: /project/i,
  area: /area/i,
  resource: /resource/i,
  archive: /archive/i,
  template: /template/i,
  daily: /daily/i,
  notes: /^notes$/i,
};

export type FolderRole = keyof typeof FOLDER_MATCHERS | "other";

export function folderRole(name: string): FolderRole {
  for (const [role, re] of Object.entries(FOLDER_MATCHERS)) {
    if (re.test(name)) return role as FolderRole;
  }
  return "other";
}

export function findFolder(folders: string[], role: FolderRole): string | undefined {
  return folders.find((f) => folderRole(f) === role);
}
