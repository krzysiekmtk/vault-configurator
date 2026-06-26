import type { VaultConfig } from "../config/types";
import { DAILY_SECTIONS } from "../config/catalog";

/** Per-section body: a sensible starter line for each daily-note section. */
const SECTION_BODY: Record<string, string> = {
  tasks: "- [ ] ",
  yesterday: "- ",
  notes: "- ",
  gratitude: "- ",
  ideas: "- ",
  summary: "- ",
};

/**
 * Generate the Daily Note markdown template from the selected sections.
 * Used by both the live preview and `Templates/Daily Note.md` in the ZIP.
 */
export function generateDailyNote(config: VaultConfig): string {
  const active = DAILY_SECTIONS.filter((s) => config.dailyNoteSections[s.key]);

  const lines: string[] = ["# {{date}}", ""];

  if (active.length === 0) {
    lines.push("- ");
    return lines.join("\n") + "\n";
  }

  for (const section of active) {
    lines.push(`## ${section.label}`);
    lines.push(SECTION_BODY[section.key] ?? "- ");
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}
