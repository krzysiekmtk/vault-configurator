import type { VaultConfig } from "./types";
import { TAG_GROUPS, TAG_GROUP_ORDER } from "./catalog";
import { formatTag } from "../utils/normalizeTags";

/**
 * Resolve every tag the config currently produces: enabled built-in groups
 * (flattened) plus normalized custom tags. Returns display tags with "#".
 */
export function getActiveTags(config: VaultConfig): string[] {
  const out: string[] = [];
  for (const key of TAG_GROUP_ORDER) {
    if (config.tags[key]) out.push(...TAG_GROUPS[key].tags);
  }
  for (const slug of config.tags.custom) {
    out.push(formatTag(slug));
  }
  return out;
}

/** Custom tags as display tags only (already normalized slugs in config). */
export function getCustomDisplayTags(config: VaultConfig): string[] {
  return config.tags.custom.map(formatTag);
}
