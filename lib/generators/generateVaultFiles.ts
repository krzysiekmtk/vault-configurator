import type { VaultConfig } from "../config/types";
import { CORE_PLUGINS, COMMUNITY_PLUGINS, WORKFLOW_PACK_DEFS } from "../config/catalog";
import { WORKFLOW_PACKS } from "../config/workflowPacks";
import { getActiveTags, styleSlug } from "../config/activeTags";
import { generateDailyNote } from "./generateDailyNote";
import { generateObsidianConfig } from "./generateObsidianConfig";
import { generateTemplates } from "./generateTemplates";
import { generateHomeDashboard } from "./generateHomeDashboard";
import { generateOnboardingDocs } from "./generateOnboardingDocs";
import { generateBasesDocs } from "./generateBasesDocs";
import { generateSyncAdvice } from "./generateSyncAdvice";
import { buildFrontmatter } from "./generateFrontmatter";
import {
  dateParts,
  resolveFolders,
  applyPrefix,
  folderRole,
  findFolder,
  type DateParts,
  type FolderRole,
} from "./helpers";

export interface VaultFiles {
  /** Resolved folder list (so empty folders still render / get created). */
  folders: string[];
  /** Map of vault-relative path -> file content. */
  files: Record<string, string>;
}

/** Substitute the {{date}} token in a prop list with the real ISO date. */
function withDate(props: Array<[string, string]>, iso: string): Array<[string, string]> {
  return props.map(([k, v]) => [k, v.replace(/\{\{date\}\}/g, iso)]);
}

/** Pick the first existing folder matching the given roles, else the first folder. */
function pickFolder(folders: string[], roles: string[]): string | undefined {
  for (const role of roles) {
    const found = findFolder(folders, role as FolderRole);
    if (found) return found;
  }
  return folders[0];
}

function areaNote(config: VaultConfig): string {
  const raw = config.tags.area ? ["area/work", "type/note"] : ["type/note"];
  const tags = raw.map((t) => styleSlug(t, config));
  return `${buildFrontmatter(config, [["type", "note"]], tags)}# Work

An "Area" represents an ongoing responsibility — not a project with an end date.

- Standards to maintain
- Recurring reviews
`;
}

function resourceNote(config: VaultConfig): string {
  return `${buildFrontmatter(config, [["type", "note"]], [styleSlug("type/note", config)])}# Useful Links

A place to collect references and resources.

- [Obsidian Help](https://help.obsidian.md)
- [[Useful Links]]
`;
}

function welcomeNote(config: VaultConfig): string {
  return `# Welcome to ${config.vaultName}

This vault was scaffolded with Vault Configurator.

Open [[START HERE]] for a 3-step intro, or jump into [[Home]].
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

function packLabels(config: VaultConfig): string[] {
  return config.workflowPacks.map((p) => WORKFLOW_PACK_DEFS.find((d) => d.key === p)?.label ?? p);
}

function generateReadme(config: VaultConfig, folders: string[]): string {
  const { core, community } = enabledPluginList(config);
  const tags = getActiveTags(config);
  const packs = packLabels(config);
  const advice = generateSyncAdvice(config);

  const lines: string[] = [
    `# ${config.vaultName}`,
    "",
    "An Obsidian vault scaffolded with [Vault Configurator](https://github.com/krzysiekmtk/vault-configurator).",
    "",
    "## Where to start",
    "",
    "- [[START HERE]] — 3-step intro and your main folders.",
    "- [[First 7 Days]] — a gentle ramp into the vault.",
    config.dashboard.enabled ? "- [[Home]] — your dashboard." : "",
    "- [[How to Use This Vault]] — the practical manual.",
    "",
  ];

  if (packs.length) {
    lines.push("## Your workflows", "", packs.map((p) => `- ${p}`).join("\n"), "");
  }

  lines.push("## Structure", "", "```", ...folders.map((f) => `${f}/`), "```", "");

  if (config.properties.useFrontmatter && config.properties.enabled.length) {
    lines.push(
      "## Properties",
      "",
      "Notes use YAML frontmatter with these fields:",
      "",
      config.properties.enabled.map((p) => `- \`${p}\``).join("\n"),
      "",
    );
  }

  lines.push(
    "## Core plugins",
    "",
    core.length ? core.map((c) => `- ${c}`).join("\n") : "_None selected._",
    "",
    "> Already enabled via the bundled `.obsidian/` config — just open the vault.",
    "",
    "## Community plugins to install",
    "",
    community.length ? community.map((c) => `- ${c}`).join("\n") : "_None selected._",
    "",
    "> Pre-listed in `.obsidian/community-plugins.json`, but the code is **not** bundled. Install each via **Settings → Community plugins → Browse**.",
    "",
  );

  if (config.bases.enabled && config.bases.views.length) {
    lines.push(
      "## Bases / Database views",
      "",
      "See `Bases/` for recommended database-style views (filters, columns, views). Recreate them in Obsidian Bases or as Dataview queries.",
      "",
    );
  }

  if (tags.length) {
    lines.push("## Tag system", "", tags.map((t) => `- \`${t}\``).join("\n"), "");
  }

  lines.push(
    "## Devices & sync",
    "",
    `- Devices: ${advice.deviceLabels.length ? advice.deviceLabels.join(", ") : "not set"}`,
    `- Strategy: **${advice.strategyLabel}** — ${advice.summary}`,
    "",
    ...advice.warnings.map((w) => `> ${w}`),
    "",
  );

  if (config.sync.git) {
    lines.push(
      "### Git setup",
      "",
      "```bash",
      "git init",
      "git add .",
      'git commit -m "Initial vault"',
      "```",
      "",
      "`.obsidian/workspace*` files are already ignored.",
      "",
    );
  }

  lines.push(
    "## Weekly review",
    "",
    "Once a week: review projects, clear the inbox, archive completed work.",
    "",
  );

  return lines.filter((l) => l !== undefined).join("\n");
}

function generateClaudeMd(config: VaultConfig, folders: string[]): string {
  const { core, community } = enabledPluginList(config);
  const tags = getActiveTags(config);
  const packs = packLabels(config);
  const advice = generateSyncAdvice(config);

  return [
    `# CLAUDE.md — ${config.vaultName}`,
    "",
    "Guidance for AI assistants (Claude Code) working inside this Obsidian vault.",
    "",
    "## What this is",
    "An Obsidian vault. Notes are Markdown. Links use `[[wikilink]]` syntax. Tags use `#tag` syntax.",
    "",
    packs.length ? "## Workflows in use" : "",
    packs.length ? packs.map((p) => `- ${p}`).join("\n") : "",
    packs.length ? "" : "",
    "## Folder structure",
    folders.map((f) => `- \`${f}/\``).join("\n"),
    "",
    "## Conventions",
    `- Filename prefix mode: \`${config.filePrefix}\`.`,
    `- Daily notes ${config.corePlugins.dailyNotes ? "are used" : "are not used"}; template in \`Templates/Daily Note.md\`.`,
    config.monthlySubfolders ? "- Daily notes are organized into `Daily/YYYY/MM - Month/` subfolders." : "",
    config.properties.useFrontmatter
      ? `- New notes start with YAML frontmatter using: ${config.properties.enabled.map((p) => `\`${p}\``).join(", ")}.`
      : "- Notes do not use YAML frontmatter.",
    "",
    "## Tags in use",
    tags.length ? tags.map((t) => `- \`${t}\``).join("\n") : "_None._",
    "",
    "## Plugins",
    `- Core: ${core.length ? core.join(", ") : "none"}`,
    `- Community: ${community.length ? community.join(", ") : "none"}`,
    "",
    "## Note types",
    "When creating a note, set its `type` and place it in the matching folder:",
    "- `project` → projects folder, with goal, next actions, notes.",
    "- `meeting` → with date, attendees, agenda, decisions, action items.",
    "- `research` / `source` → with the source reference.",
    "- `person` → with company, role, last_contact.",
    "- `book` / `article` → with author, status, rating.",
    "",
    "## Sync",
    `- Strategy: ${advice.strategyLabel}. ${advice.summary}`,
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
 * Single source consumed by the folder-tree preview AND the ZIP.
 */
export function generateVaultFiles(config: VaultConfig, now: Date = new Date()): VaultFiles {
  const parts = dateParts(now);
  const folders = resolveFolders(config);
  const files: Record<string, string> = {};

  // Templates: Daily Note always, plus pack-driven templates.
  files["Templates/Daily Note.md"] = generateDailyNote(config);
  Object.assign(files, generateTemplates(config));

  // Pack sample notes, placed by folder role (content-only — no new folders).
  for (const pack of config.workflowPacks) {
    const sample = WORKFLOW_PACKS[pack].sample;
    if (!sample) continue;
    const folder = pickFolder(folders, sample.folderRoles);
    const name = applyPrefix(config, sample.baseName, sample.typeForPrefix, parts);
    const path = folder ? `${folder}/${name}.md` : `${name}.md`;
    const tags = sample.tags.map((t) => styleSlug(t, config));
    files[path] = buildFrontmatter(config, withDate(sample.props, parts.iso), tags) + sample.body;
  }

  // Generic structure samples for Area / Resource folders (if present).
  const areaFolder = findFolder(folders, "area");
  if (areaFolder) {
    const name = applyPrefix(config, "Work", "note", parts);
    files[`${areaFolder}/${name}.md`] = areaNote(config);
  }
  const resourceFolder = findFolder(folders, "resource");
  if (resourceFolder) {
    const name = applyPrefix(config, "Useful Links", "note", parts);
    files[`${resourceFolder}/${name}.md`] = resourceNote(config);
  }
  const notesFolder = findFolder(folders, "notes");
  if (notesFolder) {
    files[`${notesFolder}/Welcome.md`] = welcomeNote(config);
  }

  // Daily note sample into the daily folder if one exists.
  const dailyFolder = findFolder(folders, "daily");
  if (dailyFolder && config.corePlugins.dailyNotes) {
    const sample = dailyNoteSample(parts);
    const path = config.monthlySubfolders
      ? `${dailyFolder}/${parts.year}/${parts.monthFolder}/${sample.name}`
      : `${dailyFolder}/${sample.name}`;
    files[path] = sample.content;
  }

  // Home dashboard + onboarding docs + Bases docs.
  const home = generateHomeDashboard(config, parts);
  if (home) files["Home.md"] = home;
  Object.assign(files, generateOnboardingDocs(config));
  Object.assign(files, generateBasesDocs(config));

  // Pre-baked Obsidian config so core plugins/settings are live on open.
  Object.assign(files, generateObsidianConfig(config));

  // Root docs.
  files["README.md"] = generateReadme(config, folders);
  files["CLAUDE.md"] = generateClaudeMd(config, folders);
  if (config.sync.git) files[".gitignore"] = gitignore();

  return { folders, files };
}

/** Roles that already get a representative sample file (used by previews if needed). */
export { folderRole };
