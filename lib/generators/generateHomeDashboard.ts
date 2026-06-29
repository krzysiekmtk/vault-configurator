import type { VaultConfig } from "../config/types";
import { WORKFLOW_PACKS } from "../config/workflowPacks";
import { buildFrontmatter } from "./generateFrontmatter";
import { resolveFolders, findFolder, type DateParts } from "./helpers";

const FENCE = "```";

/** Pack ids whose Home section is appended (no fixed Dashboard toggle). */
const EXTRA_SECTION_PACKS = [
  "research", "people", "learning", "journal",
  "monthly-review", "quarterly-review", "yearly-review",
] as const;

/**
 * Build `Home.md` — the vault dashboard. Returns "" when the dashboard is
 * disabled. Sections come from the Dashboard toggles plus extra sections for
 * packs without a fixed toggle. Dataview / Tasks code blocks are added only when
 * those plugins are enabled.
 */
export function generateHomeDashboard(config: VaultConfig, parts: DateParts): string {
  if (!config.dashboard.enabled) return "";

  const folders = resolveFolders(config);
  const inbox = findFolder(folders, "inbox") ?? findFolder(folders, "notes");
  const projectFolder = findFolder(folders, "project");
  const dailyFolder = findFolder(folders, "daily") ?? "Daily";
  const sections = new Set(config.dashboard.sections);
  const dv = config.communityPlugins.dataview;
  const tasksPlugin = config.communityPlugins.tasks;

  const fm = buildFrontmatter(config, [
    ["type", "dashboard"],
    ["created", parts.iso],
  ]);

  const out: string[] = [fm + "# Home", "", "Welcome to your vault.", ""];

  if (sections.has("quickCapture")) {
    out.push("## Quick Capture", inbox ? `- [[${inbox}]]` : "- Capture new notes here.", "");
  }

  if (config.corePlugins.dailyNotes) {
    out.push("## Today", `- [[${dailyFolder}/${parts.iso}]]`, "");
  }

  if (sections.has("activeProjects")) {
    out.push("## Active Projects");
    if (dv && projectFolder) {
      out.push(
        `${FENCE}dataview`,
        "TABLE status, priority, area",
        `FROM "${projectFolder}"`,
        'WHERE type = "project" AND status != "archived"',
        "SORT priority DESC",
        FENCE,
      );
    } else {
      out.push("Review your current projects here.");
    }
    out.push("");
  }

  if (sections.has("openTasks")) {
    out.push("## Open Tasks");
    if (tasksPlugin) {
      out.push(`${FENCE}tasks`, "not done", "sort by due", FENCE);
    } else {
      out.push("Track next actions with checkboxes or the Tasks plugin.");
    }
    out.push("");
  }

  if (sections.has("recentMeetings")) {
    out.push("## Recent Meetings", "Keep meeting notes linked to projects and people.", "");
  }

  if (sections.has("readingList")) {
    out.push("## Reading List", "Track books, articles and papers.", "");
  }

  if (sections.has("contentPipeline")) {
    out.push("## Content Pipeline", "Move ideas from draft to published.", "");
  }

  for (const pack of EXTRA_SECTION_PACKS) {
    if (!config.workflowPacks.includes(pack)) continue;
    const sec = WORKFLOW_PACKS[pack].homeSection;
    if (sec) out.push(`## ${sec.title}`, sec.body, "");
  }

  if (sections.has("weeklyReview")) {
    out.push("## Weekly Review", "- [[Weekly Review]]", "");
  }

  return out.join("\n").trimEnd() + "\n";
}
