import type { VaultConfig } from "./types";
import { TAG_GROUPS, TAG_GROUP_ORDER } from "./catalog";
import { formatTag } from "../utils/normalizeTags";

/**
 * Convert a canonical (nested) tag to the configured style.
 * Nested: `#status/todo` stays `#status/todo`.
 * Flat:   `#status/todo` becomes `#todo` (last path segment).
 */
export function styleTag(tag: string, config: VaultConfig): string {
  if (config.tagStyle === "flat") {
    const slug = tag.replace(/^#/, "").split("/").pop() ?? "";
    return formatTag(slug);
  }
  return tag;
}

/** Same as styleTag but for a raw slug (no leading #), returns a slug. */
export function styleSlug(slug: string, config: VaultConfig): string {
  return config.tagStyle === "flat" ? (slug.split("/").pop() ?? slug) : slug;
}

/**
 * Resolve every tag the config currently produces: enabled built-in groups
 * (flattened) plus normalized custom tags, in the configured style.
 */
export function getActiveTags(config: VaultConfig): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (t: string) => {
    if (!seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  };

  for (const key of TAG_GROUP_ORDER) {
    if (config.tags[key]) {
      for (const t of TAG_GROUPS[key].tags) push(styleTag(t, config));
    }
  }
  for (const slug of config.tags.custom) push(formatTag(slug));
  return out;
}

/** Custom tags as display tags only (already normalized slugs in config). */
export function getCustomDisplayTags(config: VaultConfig): string[] {
  return config.tags.custom.map(formatTag);
}
