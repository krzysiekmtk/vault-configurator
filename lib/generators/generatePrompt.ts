import type { VaultConfig } from "../config/types";
import { CORE_PLUGINS, COMMUNITY_PLUGINS, WORKFLOW_PACK_DEFS } from "../config/catalog";
import { getActiveTags } from "../config/activeTags";
import { generateFolderTree, asciiTree } from "./generateFolderTree";
import { generateDailyNote } from "./generateDailyNote";
import { generateTemplates } from "./generateTemplates";
import { generateSyncAdvice } from "./generateSyncAdvice";
import { calculateVaultHealth } from "../health/calculateVaultHealth";

const PREFIX_LABEL: Record<VaultConfig["filePrefix"], string> = {
  none: "no filename prefix",
  "date-dash": "a `YYYY-MM-DD-` filename prefix",
  "date-compact": "a `YYYYMMDD-` filename prefix",
  "date-bracket-mdy": "a bracketed `[MM-DD-YYYY]` date prefix",
  type: "a type-based filename prefix (e.g. `project-`, `note-`, `meeting-`)",
};

/**
 * Generate the ready-to-paste Claude Code prompt describing the vault to build.
 * Deterministic so the preview and the copied text always match.
 */
export function generatePrompt(config: VaultConfig, now: Date = new Date()): string {
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
