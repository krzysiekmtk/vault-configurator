import type { VaultConfig } from "../config/types";
import { WORKFLOW_PACK_DEFS } from "../config/catalog";
import { resolveFolders, findFolder } from "./helpers";
import { generateTemplates } from "./generateTemplates";

/**
 * Build the onboarding doc set placed at the vault root:
 *   START HERE.md, First 7 Days.md, Vault Map.md, How to Use This Vault.md
 * Content adapts to the selected Workflow Packs and folder structure.
 */
export function generateOnboardingDocs(config: VaultConfig): Record<string, string> {
  const folders = resolveFolders(config);
  const inbox = findFolder(folders, "inbox") ?? findFolder(folders, "notes") ?? folders[0] ?? "Inbox";
  const packLabels = config.workflowPacks.map(
    (p) => WORKFLOW_PACK_DEFS.find((d) => d.key === p)?.label ?? p,
  );
  const templateNames = Object.keys(generateTemplates(config))
    .map((p) => p.replace(/^Templates\//, "").replace(/\.md$/, ""))
    .sort();
  const hasHome = config.dashboard.enabled;

  return {
    "START HERE.md": startHere(config, packLabels, folders, inbox, hasHome),
    "First 7 Days.md": firstSevenDays(config),
    "Vault Map.md": vaultMap(config, folders, templateNames, hasHome),
    "How to Use This Vault.md": howToUse(config),
  };
}

function startHere(
  config: VaultConfig,
  packLabels: string[],
  folders: string[],
  inbox: string,
  hasHome: boolean,
): string {
  const lines = [
    "# Start Here",
    "",
    `Welcome to **${config.vaultName}**.`,
    "",
    "## Start with these 3 steps",
    "",
    `1. Open ${hasHome ? "[[Home]]" : "this note"}`,
    config.corePlugins.dailyNotes ? "2. Create your first Daily Note" : "2. Create your first note",
    `3. Capture your first idea in [[${inbox}]]`,
    "",
  ];

  if (packLabels.length) {
    lines.push("## Your selected workflows", "", ...packLabels.map((p) => `- ${p}`), "");
  }

  lines.push("## Your main folders", "", ...folders.map((f) => `- ${f}`), "");
  lines.push(
    "## Recommended weekly habit",
    "",
    "Once a week, review your projects, open tasks and inbox. Archive what is done.",
    "",
  );
  return lines.join("\n");
}

function firstSevenDays(config: VaultConfig): string {
  const packs = new Set(config.workflowPacks);
  const day4 = ["## Day 4 — Templates"];
  if (packs.has("projects")) day4.push("- Create one Project Note");
  if (packs.has("meetings")) day4.push("- Create one Meeting Note");
  if (packs.has("research")) day4.push("- Create one Research Note");
  if (packs.has("reading")) day4.push("- Add one book to your Reading List");
  if (day4.length === 1) day4.push("- Try one of your templates");

  return [
    "# First 7 Days",
    "",
    "A gentle ramp into your vault. One small step per day.",
    "",
    "## Day 1 — Capture",
    "- Add 3 notes to your Inbox",
    config.corePlugins.dailyNotes ? "- Create your first Daily Note" : "- Create your first note",
    "",
    "## Day 2 — Organize",
    "- Move Inbox notes into the right folders",
    "",
    "## Day 3 — Connect",
    "- Add `[[links]]` between related notes",
    "",
    ...day4,
    "",
    "## Day 5 — Tasks",
    "- Add 3 actionable tasks",
    "",
    "## Day 6 — Review",
    "- Review active projects and open tasks",
    "",
    "## Day 7 — Simplify",
    "- Remove anything you do not use",
    "",
  ].join("\n");
}

function vaultMap(
  config: VaultConfig,
  folders: string[],
  templateNames: string[],
  hasHome: boolean,
): string {
  const core = ["## Core"];
  if (hasHome) core.push("- [[Home]]");
  core.push("- [[START HERE]]", "- [[First 7 Days]]", "- [[How to Use This Vault]]");

  const lines = ["# Vault Map", "", ...core, "", "## Folders", "", ...folders.map((f) => `- ${f}`), ""];

  if (config.corePlugins.dailyNotes) templateNames.unshift("Daily Note");
  if (templateNames.length) {
    lines.push("## Templates", "", ...[...new Set(templateNames)].map((t) => `- [[${t}]]`), "");
  }
  return lines.join("\n");
}

function howToUse(config: VaultConfig): string {
  const lines = [
    "# How to Use This Vault",
    "",
    "A short, practical manual. Keep it simple — the system should serve you.",
    "",
    "## Creating notes",
    "- Put new notes in the folder that matches their purpose.",
    config.corePlugins.templates
      ? "- Use the Templates plugin to insert a starter template."
      : "- Copy a file from `Templates/` to start from a template.",
    "",
  ];

  if (config.properties.useFrontmatter) {
    lines.push(
      "## Properties",
      "- Notes start with a YAML frontmatter block (between `---` lines).",
      "- Fill in fields like `status`, `priority` and `area` to make notes queryable.",
      "",
    );
  }

  lines.push(
    "## Tags",
    config.tagStyle === "flat"
      ? "- Tags are flat, e.g. `#note`, `#work`."
      : "- Tags are nested, e.g. `#type/note`, `#area/work`.",
    "- Be consistent — reuse existing tags instead of inventing new ones.",
    "",
    "## Weekly review",
    "- Once a week: review projects, clear the inbox, archive completed work.",
    "",
    "## Do not over-engineer",
    "- Start with 2–3 workflows. Add structure only when you feel the need.",
    "- A note you can find beats a perfect system you never use.",
    "",
  );
  return lines.join("\n");
}
