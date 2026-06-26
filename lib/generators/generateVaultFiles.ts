import type { VaultConfig } from "../config/types";
import { CORE_PLUGINS, COMMUNITY_PLUGINS } from "../config/catalog";
import { getActiveTags } from "../config/activeTags";
import { generateDailyNote } from "./generateDailyNote";
import {
  dateParts,
  resolveFolders,
  applyPrefix,
  folderRole,
  findFolder,
  type DateParts,
} from "./helpers";

export interface VaultFiles {
  /** Resolved folder list (so empty folders still render / get created). */
  folders: string[];
  /** Map of vault-relative path -> file content. */
  files: Record<string, string>;
}

function frontmatter(tags: string[], extra: Record<string, string> = {}): string {
  const lines = ["---"];
  for (const [k, v] of Object.entries(extra)) lines.push(`${k}: ${v}`);
  if (tags.length) {
    lines.push("tags:");
    for (const t of tags) lines.push(`  - ${t.replace(/^#/, "")}`);
  }
  lines.push("---", "");
  return lines.join("\n");
}

function projectTemplate(): string {
  return `---
type: project
status: status/todo
priority: priority/medium
---

# {{title}}

## Goal


## Tasks
- [ ]

## Notes


## Resources
-
`;
}

function meetingTemplate(): string {
  return `---
type: meeting
date: {{date}}
---

# {{title}}

**Attendees:**

## Agenda
-

## Notes
-

## Action items
- [ ]
`;
}

function exampleProjectNote(config: VaultConfig, parts: DateParts): string {
  const tags = ["type/project"];
  if (config.tags.status) tags.push("status/wip");
  if (config.tags.priority) tags.push("priority/high");
  return `${frontmatter(tags, { created: parts.iso })}# Example Project

A sample project note showing how your vault is structured.

## Goal
Ship the first version.

## Tasks
- [ ] Define scope
- [ ] Build it
- [x] Set up the vault

## Notes
Link related notes with [[Useful Links]].
`;
}

function areaNote(config: VaultConfig): string {
  const tags = config.tags.area ? ["area/work", "type/note"] : ["type/note"];
  return `${frontmatter(tags)}# Work

An "Area" represents an ongoing responsibility — not a project with an end date.

- Standards to maintain
- Recurring reviews
`;
}

function resourceNote(): string {
  return `${frontmatter(["type/note"])}# Useful Links

A place to collect references and resources.

- [Obsidian Help](https://help.obsidian.md)
- [[Example Project]]
`;
}

function welcomeNote(config: VaultConfig): string {
  return `${frontmatter([])}# Welcome to ${config.vaultName}

This vault was scaffolded with Vault Configurator.

Open the command palette and explore. Start by editing this note or creating a daily note.
`;
}

function dailyNoteSample(parts: DateParts): { name: string; content: string } {
  return {
    name: `${parts.iso} Daily Note.md`,
    content: `# ${parts.iso}\n\nFirst daily note. Your template lives in \`Templates/Daily Note.md\`.\n`,
  };
}

function enabledPluginList(config: VaultConfig): { core: string[]; community: string[] } {
  return {
    core: CORE_PLUGINS.filter((p) => config.corePlugins[p.key]).map((p) => p.label),
    community: COMMUNITY_PLUGINS.filter((p) => config.communityPlugins[p.key]).map((p) => p.label),
  };
}

function generateReadme(config: VaultConfig, folders: string[]): string {
  const { core, community } = enabledPluginList(config);
  const tags = getActiveTags(config);

  const lines: string[] = [
    `# ${config.vaultName}`,
    "",
    "An Obsidian vault scaffolded with [Vault Configurator](https://github.com/krzysiekmtk/vault-configurator).",
    "",
    "## Structure",
    "",
    "```",
    ...folders.map((f) => `${f}/`),
    "```",
    "",
    "## Core plugins to enable",
    "",
    core.length ? core.map((c) => `- ${c}`).join("\n") : "_None selected._",
    "",
    "Enable these under **Settings → Core plugins**.",
    "",
    "## Community plugins to install",
    "",
    community.length ? community.map((c) => `- ${c}`).join("\n") : "_None selected._",
    "",
    "> Community plugins are **not** bundled in this vault. Install them manually via **Settings → Community plugins → Browse**, then enable each one.",
    "",
  ];

  if (tags.length) {
    lines.push("## Tag system", "", tags.map((t) => `- \`${t}\``).join("\n"), "");
  }

  if (config.sync.git) {
    lines.push(
      "## Git sync",
      "",
      "This vault includes a `.gitignore`. Recommended workflow:",
      "",
      "```bash",
      "git init",
      "git add .",
      'git commit -m "Initial vault"',
      "```",
      "",
      "Commit regularly. Avoid committing the `.obsidian/workspace*` files (already ignored).",
      "",
    );
  }

  if (config.sync.icloud) {
    lines.push(
      "## iCloud sync",
      "",
      "To sync via iCloud, move this folder into `iCloud Drive` and open it from the Obsidian mobile/desktop app pointed at the same iCloud folder.",
      "",
      "> Point Obsidian at the iCloud folder yourself. Do not run Git and iCloud on the same vault simultaneously — it can corrupt history.",
      "",
    );
  }

  return lines.join("\n");
}

function generateClaudeMd(config: VaultConfig, folders: string[]): string {
  const { core, community } = enabledPluginList(config);
  const tags = getActiveTags(config);
  return [
    `# CLAUDE.md — ${config.vaultName}`,
    "",
    "Guidance for AI assistants (Claude Code) working inside this Obsidian vault.",
    "",
    "## What this is",
    "An Obsidian vault. Notes are Markdown files. Links use `[[wikilink]]` syntax. Tags use `#tag` syntax.",
    "",
    "## Folder structure",
    folders.map((f) => `- \`${f}/\``).join("\n"),
    "",
    "## Conventions",
    `- Filename prefix mode: \`${config.filePrefix}\`.`,
    `- Daily notes ${config.corePlugins.dailyNotes ? "are used" : "are not used"}; template in \`Templates/Daily Note.md\`.`,
    config.monthlySubfolders ? "- Daily notes are organized into `Daily/YYYY/MM - Month/` subfolders." : "",
    "",
    "## Tags in use",
    tags.length ? tags.map((t) => `- \`${t}\``).join("\n") : "_None._",
    "",
    "## Plugins",
    `- Core: ${core.length ? core.join(", ") : "none"}`,
    `- Community: ${community.length ? community.join(", ") : "none"}`,
    "",
    "## Rules for AI edits",
    "- Preserve YAML frontmatter and existing wikilinks.",
    "- Use the tag conventions above; do not invent new tag namespaces without asking.",
    "- Place new notes in the correct folder by their type.",
    "- Do not run destructive shell commands without explicit confirmation.",
    "- Ask when unsure about structure or naming.",
    "",
  ]
    .filter((l) => l !== "")
    .join("\n");
}

function gitignore(): string {
  return [
    "# Obsidian workspace state (machine-specific)",
    ".obsidian/workspace.json",
    ".obsidian/workspace-mobile.json",
    ".obsidian/cache",
    "",
    "# OS files",
    ".DS_Store",
    "Thumbs.db",
    "",
    "# Trash",
    ".trash/",
    "",
  ].join("\n");
}

/**
 * Build the complete vault: folder list + every file with its content.
 * This is the single source consumed by both the folder-tree preview and the ZIP.
 */
export function generateVaultFiles(config: VaultConfig, now: Date = new Date()): VaultFiles {
  const parts = dateParts(now);
  const folders = resolveFolders(config);
  const files: Record<string, string> = {};

  // Templates (always provide the starter set).
  files["Templates/Daily Note.md"] = generateDailyNote(config);
  files["Templates/Project Note.md"] = projectTemplate();
  files["Templates/Meeting Note.md"] = meetingTemplate();

  // Sample notes mapped onto folders by their role.
  const projectFolder = findFolder(folders, "project");
  if (projectFolder) {
    const name = applyPrefix(config, "Example Project", "project", parts);
    files[`${projectFolder}/${name}.md`] = exampleProjectNote(config, parts);
  }

  const areaFolder = findFolder(folders, "area");
  if (areaFolder) {
    const name = applyPrefix(config, "Work", "note", parts);
    files[`${areaFolder}/${name}.md`] = areaNote(config);
  }

  const resourceFolder = findFolder(folders, "resource");
  if (resourceFolder) {
    const name = applyPrefix(config, "Useful Links", "note", parts);
    files[`${resourceFolder}/${name}.md`] = resourceNote();
  }

  const notesFolder = findFolder(folders, "notes");
  if (notesFolder) {
    files[`${notesFolder}/Welcome.md`] = welcomeNote(config);
  }

  // Daily note sample placed into the daily folder if one exists.
  const dailyFolder = findFolder(folders, "daily");
  if (dailyFolder && config.corePlugins.dailyNotes) {
    const sample = dailyNoteSample(parts);
    const path = config.monthlySubfolders
      ? `${dailyFolder}/${parts.year}/${parts.monthFolder}/${sample.name}`
      : `${dailyFolder}/${sample.name}`;
    files[path] = sample.content;
  }

  // Root docs.
  files["README.md"] = generateReadme(config, folders);
  files["CLAUDE.md"] = generateClaudeMd(config, folders);
  if (config.sync.git) files[".gitignore"] = gitignore();

  return { folders, files };
}

/** Roles that already get a representative sample file (used by previews if needed). */
export { folderRole };
