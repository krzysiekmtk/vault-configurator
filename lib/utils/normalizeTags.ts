/**
 * Normalize a raw user tag string into Obsidian-style slugs (without the leading "#").
 *
 * Rules:
 * - Accepts comma- or newline-separated input, or an already-split array.
 * - Strips a leading "#" so we never double it.
 * - Lowercases, trims, replaces whitespace runs with "-".
 * - Keeps only [a-z0-9-_/] (slashes allowed for nested tags like work/clientA).
 * - Drops empties and de-duplicates while preserving order.
 */
export function normalizeTags(input: string | string[]): string[] {
  const parts = Array.isArray(input) ? input : input.split(/[,\n]/);
  const seen = new Set<string>();
  const out: string[] = [];

  for (const raw of parts) {
    const slug = raw
      .trim()
      .replace(/^#+/, "")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-_/]/g, "")
      .replace(/-{2,}/g, "-")
      .replace(/^[-/]+|[-/]+$/g, "");

    if (slug && !seen.has(slug)) {
      seen.add(slug);
      out.push(slug);
    }
  }
  return out;
}

/** Render a normalized slug as a display tag with a single leading "#". */
export function formatTag(slug: string): string {
  return `#${slug}`;
}
