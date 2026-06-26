import type { VaultConfig } from "../config/types";
import { CORE_PLUGINS, COMMUNITY_PLUGINS } from "../config/catalog";
import { getActiveTags } from "../config/activeTags";
import { generateFolderTree, asciiTree } from "./generateFolderTree";
import { generateDailyNote } from "./generateDailyNote";

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

  const sections: string[] = [];

  sections.push(
    `You are helping me set up an Obsidian vault named "${config.vaultName}". ` +
      `Create (or extend, if it already exists) the structure below. Use ${PREFIX_LABEL[config.filePrefix]}.`,
  );

  sections.push(`## Folder structure\n\n\`\`\`\n${asciiTree(tree)}\n\`\`\``);

  sections.push(
    `## Templates\n\nCreate these in \`Templates/\`:\n` +
      `- \`Daily Note.md\`\n- \`Project Note.md\`\n- \`Meeting Note.md\`\n\n` +
      `The Daily Note template should be:\n\n\`\`\`markdown\n${daily.trimEnd()}\n\`\`\``,
  );

  sections.push(
    `## Sample notes\n\nCreate a few example notes (a project, an area, a resource) with YAML frontmatter ` +
      `that uses the tag system below, so the structure is immediately clear.`,
  );

  if (tags.length) {
    sections.push(`## Tag system\n\nUse these tags consistently:\n${tags.map((t) => `- \`${t}\``).join("\n")}`);
  }

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
    `## Docs\n\nAlso create:\n- \`README.md\` describing the vault structure and plugin setup.\n` +
      `- \`CLAUDE.md\` with conventions for future AI edits.`,
  );

  if (config.sync.git) {
    sections.push(
      `## Git\n\nAdd a \`.gitignore\` that ignores \`.obsidian/workspace*\` and OS files. ` +
        `You may suggest \`git init\`, but do not run any destructive git commands without my confirmation.`,
    );
  }
  if (config.sync.icloud) {
    sections.push(
      `## iCloud\n\nNote in the README that I will move the vault into iCloud Drive myself. ` +
        `Do not attempt any iCloud integration.`,
    );
  }

  sections.push(
    `## Rules\n\n- Do not run destructive commands without explicit confirmation.\n` +
      `- Ask me if anything is ambiguous instead of guessing.\n` +
      `- Keep filenames and tags consistent with the conventions above.`,
  );

  return sections.join("\n\n");
}
