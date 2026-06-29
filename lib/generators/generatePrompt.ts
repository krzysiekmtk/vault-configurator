import type { VaultConfig } from "../config/types";
import { CORE_PLUGINS, COMMUNITY_PLUGINS, WORKFLOW_PACK_DEFS } from "../config/catalog";
import { getActiveTags } from "../config/activeTags";
import { generateFolderTree, asciiTree } from "./generateFolderTree";
import { generateDailyNote } from "./generateDailyNote";
import { generateTemplates } from "./generateTemplates";
import { generateSyncAdvice } from "./generateSyncAdvice";
import { calculateVaultHealth } from "../health/calculateVaultHealth";
import { generateVaultFiles } from "./generateVaultFiles";

const PREFIX_LABEL: Record<VaultConfig["filePrefix"], string> = {
  none: "no filename prefix",
  "date-dash": "a `YYYY-MM-DD-` filename prefix",
  "date-compact": "a `YYYYMMDD-` filename prefix",
  "date-bracket-mdy": "a bracketed `[MM-DD-YYYY]` date prefix",
  type: "a type-based filename prefix (e.g. `project-`, `note-`, `meeting-`)",
};

function generateNewVaultPrompt(config: VaultConfig, now: Date): string {
  const tree = generateFolderTree(config, now);
  const tags = getActiveTags(config);
  const core = CORE_PLUGINS.filter((p) => config.corePlugins[p.key]).map((p) => p.label);
  const community = COMMUNITY_PLUGINS.filter((p) => config.communityPlugins[p.key]).map((p) => p.label);
  const daily = generateDailyNote(config);
  const packs = config.workflowPacks.map(
    (p) => WORKFLOW_PACK_DEFS.find((d) => d.key === p)?.label ?? p,
  );
  const templateNames = ["Daily Note", ...Object.keys(generateTemplates(config)).map((p) =>
    p.replace(/^Templates\//, "").replace(/\.md$/, ""),
  )];
  const advice = generateSyncAdvice(config);
  const health = calculateVaultHealth(config);

  const sections: string[] = [];

  sections.push(
    `You are helping me set up an Obsidian vault named "${config.vaultName}". ` +
      `Create (or extend, if it already exists) the structure below. Use ${PREFIX_LABEL[config.filePrefix]}.`,
  );

  if (packs.length) {
    sections.push(
      `## What this vault is for\n\nI want this vault to help me with:\n${packs.map((p) => `- ${p}`).join("\n")}`,
    );
  }

  sections.push(`## Folder structure\n\n\`\`\`\n${asciiTree(tree)}\n\`\`\``);

  sections.push(
    `## Templates\n\nCreate these in \`Templates/\`:\n${templateNames.map((t) => `- \`${t}.md\``).join("\n")}\n\n` +
      `The Daily Note template should be:\n\n\`\`\`markdown\n${daily.trimEnd()}\n\`\`\``,
  );

  if (config.properties.useFrontmatter && config.properties.enabled.length) {
    sections.push(
      `## Properties / frontmatter\n\nStart notes with YAML frontmatter. Use these fields where relevant:\n` +
        `${config.properties.enabled.map((p) => `- \`${p}\``).join("\n")}\n\n` +
        `Set \`created\`/\`updated\` to today's date. Leave unknown fields blank.`,
    );
  }

  sections.push(
    `## Sample notes\n\nCreate a few example notes (one per workflow above) with frontmatter ` +
      `and the tag system below, so the structure is immediately clear.`,
  );

  if (tags.length) {
    sections.push(`## Tag system\n\nUse these tags consistently:\n${tags.map((t) => `- \`${t}\``).join("\n")}`);
  }

  if (config.dashboard.enabled) {
    sections.push(
      `## Home dashboard\n\nCreate a \`Home.md\` dashboard linking to the inbox, today's daily note, ` +
        `and sections for the workflows above` +
        (config.communityPlugins.dataview ? `, with Dataview query blocks where useful.` : `.`),
    );
  }

  if (config.bases.enabled && config.bases.views.length) {
    sections.push(
      `## Bases / database views\n\nCreate a \`Bases/\` folder with markdown notes describing these views ` +
        `(filters, columns, views): ${config.bases.views.join(", ")}. ` +
        `Do not assume a specific \`.base\` file format — describe the views in markdown` +
        (config.communityPlugins.dataview ? ` and add Dataview queries as an alternative.` : `.`),
    );
  }

  sections.push(
    `## Onboarding docs\n\nAlso create these root docs, tailored to the workflows above:\n` +
      `- \`START HERE.md\`\n- \`First 7 Days.md\`\n- \`Vault Map.md\`\n- \`How to Use This Vault.md\``,
  );

  if (config.corePlugins.dailyNotes) {
    sections.push(
      `## Daily notes\n\nDaily notes are used` +
        (config.monthlySubfolders ? `, organized into \`Daily/YYYY/MM - Month/\` subfolders.` : `.`),
    );
  }

  const pluginLines: string[] = [];
  if (core.length) pluginLines.push(`Core plugins to recommend enabling: ${core.join(", ")}.`);
  if (community.length)
    pluginLines.push(
      `Community plugins to recommend installing manually (do not try to install them): ${community.join(", ")}.`,
    );
  if (pluginLines.length) sections.push(`## Plugins\n\n${pluginLines.join("\n")}`);

  sections.push(
    `## Devices & sync\n\n- Devices: ${advice.deviceLabels.length ? advice.deviceLabels.join(", ") : "not set"}\n` +
      `- Sync strategy: ${advice.strategyLabel} — ${advice.summary}\n` +
      advice.warnings.map((w) => `- Note: ${w}`).join("\n"),
  );

  sections.push(
    `## Setup health (for context)\n\n` +
      `- Complexity: ${health.complexity}\n- Beginner friendliness: ${health.beginnerFriendliness}\n` +
      `- Mobile risk: ${health.mobileRisk}\n- Plugin dependency: ${health.pluginDependency}\n` +
      `- Maintenance effort: ${health.maintenanceEffort}\n\n` +
      health.recommendations.map((r) => `- ${r}`).join("\n"),
  );

  sections.push(
    `## Docs\n\nAlso create:\n- \`README.md\` describing the vault structure and plugin setup.\n` +
      `- \`CLAUDE.md\` with conventions for future AI edits.`,
  );

  if (config.sync.git) {
    sections.push(
      `## Git\n\nAdd a \`.gitignore\` that ignores \`.obsidian/workspace*\` and OS files. ` +
        `You may suggest \`git init\`, but do not run any destructive git commands without my confirmation.`,
    );
  }

  sections.push(
    `## Rules\n\n- Do not run destructive commands without explicit confirmation.\n` +
      `- Ask me if anything is unclear or you do not know something, instead of guessing.\n` +
      `- Keep filenames, properties and tags consistent with the conventions above.`,
  );

  return sections.join("\n\n");
}

function generateTemplatesOnlyPrompt(config: VaultConfig, now: Date): string {
  const templateFiles = generateTemplates(config);
  const daily = generateDailyNote(config);
  const allTemplates: Record<string, string> = {
    "Templates/Daily Note.md": daily,
    ...templateFiles,
  };

  const sections: string[] = [
    `Generate only the following template files for the vault "${config.vaultName}". Place each in the \`Templates/\` folder.`,
  ];

  for (const [path, content] of Object.entries(allTemplates)) {
    const name = path.replace(/^Templates\//, "").replace(/\.md$/, "");
    sections.push(`## ${name}\n\nFile: \`${path}\`\n\n\`\`\`markdown\n${content.trimEnd()}\n\`\`\``);
  }

  sections.push(`## Rules\n\n- Do not modify any existing notes.\n- Only create the template files listed above.`);

  return sections.join("\n\n");
}

function generateReadmeOnlyPrompt(config: VaultConfig, now: Date): string {
  const { files } = generateVaultFiles(config, now);
  const readme = files["README.md"] ?? "";
  const claudeMd = files["CLAUDE.md"] ?? "";

  return [
    `Generate (or overwrite) only the two documentation files for the vault "${config.vaultName}". Do not modify any notes or templates.`,
    `## README.md\n\n\`\`\`markdown\n${readme.trimEnd()}\n\`\`\``,
    `## CLAUDE.md\n\n\`\`\`markdown\n${claudeMd.trimEnd()}\n\`\`\``,
    `## Rules\n\n- Only create or overwrite README.md and CLAUDE.md.\n- Do not touch any other files.`,
  ].join("\n\n");
}

function generateImplementationPlanPrompt(config: VaultConfig): string {
  const packs = config.workflowPacks.map(
    (p) => WORKFLOW_PACK_DEFS.find((d) => d.key === p)?.label ?? p,
  );
  const templateFiles = generateTemplates(config);
  const templateNames = ["Daily Note", ...Object.keys(templateFiles).map((p) =>
    p.replace(/^Templates\//, "").replace(/\.md$/, ""),
  )];

  const sections: string[] = [
    `Create a structured implementation plan for the vault "${config.vaultName}". Do not include shell commands. Describe each step in plain language.`,
  ];

  sections.push(
    `## Phase 1: Create folder structure\n\n` +
    (packs.length
      ? `Based on the selected workflows (${packs.join(", ")}), create the appropriate folders.`
      : `Use the minimal folder structure: Inbox, Notes, Templates.`),
  );

  sections.push(
    `## Phase 2: Create templates\n\nCreate these template files in the \`Templates/\` folder:\n` +
    templateNames.map((t) => `- \`${t}.md\``).join("\n"),
  );

  if (packs.length) {
    sections.push(
      `## Phase 3: Create sample notes\n\nCreate one sample note per workflow to demonstrate the structure:\n` +
      packs.map((p) => `- A sample note for the "${p}" workflow`).join("\n"),
    );
  }

  if (config.dashboard.enabled) {
    sections.push(`## Phase 4: Create Home dashboard\n\nCreate \`Home.md\` as the main entry point with links to all sections.`);
  }

  sections.push(
    `## Phase 5: Create onboarding docs\n\nCreate these root docs:\n` +
    `- \`START HERE.md\` — 3-step intro\n- \`First 7 Days.md\` — gentle ramp\n` +
    `- \`Vault Map.md\` — where everything lives\n- \`How to Use This Vault.md\` — the manual`,
  );

  sections.push(
    `## Phase 6: Create documentation\n\nCreate:\n- \`README.md\` — vault overview\n- \`CLAUDE.md\` — AI conventions`,
  );

  if (config.bases.enabled && config.bases.views.length) {
    sections.push(
      `## Phase 7: Create Bases docs\n\nCreate \`Bases/README.md\` and one doc per view: ${config.bases.views.join(", ")}.`,
    );
  }

  sections.push(`## Rules\n\n- Do not include shell commands.\n- Ask before creating anything not listed above.`);

  return sections.join("\n\n");
}

/**
 * Generate the ready-to-paste Claude Code prompt describing the vault to build.
 * Deterministic so the preview and the copied text always match.
 * Branches on `config.promptMode` to emit different prompt types.
 */
export function generatePrompt(config: VaultConfig, now: Date = new Date()): string {
  switch (config.promptMode) {
    case "templates-only":
      return generateTemplatesOnlyPrompt(config, now);
    case "readme-only":
      return generateReadmeOnlyPrompt(config, now);
    case "implementation-plan":
      return generateImplementationPlanPrompt(config);
    default:
      return generateNewVaultPrompt(config, now);
  }
}
