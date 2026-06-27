import type { VaultConfig } from "../config/types";
import { PROPERTY_KEYS } from "../config/schema";

const GOVERNED = new Set<string>(PROPERTY_KEYS);

/**
 * Build a YAML frontmatter block from scalar props + tags, honoring the
 * Properties config.
 *
 * - Returns "" when `useFrontmatter` is off, or when nothing would be emitted.
 * - Generic props that are part of PROPERTY_KEYS (type, status, created…) are
 *   only emitted when enabled in the Properties toggles.
 * - Pack-specific props NOT in PROPERTY_KEYS (date, attendees, channel, author…)
 *   always pass through — the toggles only gate the cross-cutting fields.
 * - `tags` are emitted only when the `tags` property is enabled.
 */
export function buildFrontmatter(
  config: VaultConfig,
  values: Array<[string, string]>,
  tags: string[] = [],
): string {
  if (!config.properties.useFrontmatter) return "";

  const enabled = new Set<string>(config.properties.enabled);
  const lines: string[] = [];

  for (const [key, value] of values) {
    if (GOVERNED.has(key) && !enabled.has(key)) continue;
    lines.push(`${key}: ${value}`);
  }

  const emitTags = enabled.has("tags") && tags.length > 0;
  if (lines.length === 0 && !emitTags) return "";

  const out = ["---", ...lines];
  if (emitTags) {
    out.push("tags:");
    for (const t of tags) out.push(`  - ${t.replace(/^#/, "")}`);
  }
  out.push("---", "");
  return out.join("\n");
}
