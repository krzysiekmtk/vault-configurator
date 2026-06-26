import type { VaultConfig } from "../config/types";
import { CORE_PLUGINS, COMMUNITY_PLUGINS } from "../config/catalog";
import { resolveFolders, findFolder } from "./helpers";

/**
 * Generate the `.obsidian/` config so the vault opens already set up:
 * - core plugins the user picked are enabled (`core-plugins.json`)
 * - Daily Notes / Templates point at the right folders + template
 * - community plugins are pre-listed so they're enabled once their code is installed
 *
 * Community plugin *binaries* are NOT bundled — Obsidian downloads those itself.
 */
export function generateObsidianConfig(config: VaultConfig): Record<string, string> {
  const files: Record<string, string> = {};
  const folders = resolveFolders(config);

  // Always-on basics for a usable vault, plus the user's core selections.
  const corePlugins: Record<string, boolean> = {
    "file-explorer": true,
    "global-search": true,
    switcher: true,
    "command-palette": true,
    "page-preview": true,
  };
  for (const p of CORE_PLUGINS) {
    if (config.corePlugins[p.key]) corePlugins[p.obsidianId] = true;
  }
  files[".obsidian/core-plugins.json"] = JSON.stringify(corePlugins, null, 2);

  files[".obsidian/app.json"] = JSON.stringify(
    { alwaysUpdateLinks: true, newFileLocation: "current" },
    null,
    2,
  );

  if (config.corePlugins.dailyNotes) {
    const dailyFolder = findFolder(folders, "daily") ?? "Daily";
    const templateFolder = findFolder(folders, "template") ?? "Templates";
    files[".obsidian/daily-notes.json"] = JSON.stringify(
      {
        folder: dailyFolder,
        // Path-aware moment format gives automatic monthly subfolders when enabled.
        format: config.monthlySubfolders ? "YYYY/MM - MMMM/YYYY-MM-DD" : "YYYY-MM-DD",
        template: `${templateFolder}/Daily Note`,
        autorun: false,
      },
      null,
      2,
    );
  }

  if (config.corePlugins.templates) {
    const templateFolder = findFolder(folders, "template") ?? "Templates";
    files[".obsidian/templates.json"] = JSON.stringify(
      { folder: templateFolder, dateFormat: "YYYY-MM-DD", timeFormat: "HH:mm" },
      null,
      2,
    );
  }

  const enabledCommunity = COMMUNITY_PLUGINS.filter(
    (p) => config.communityPlugins[p.key],
  ).map((p) => p.obsidianId);
  if (enabledCommunity.length) {
    files[".obsidian/community-plugins.json"] = JSON.stringify(enabledCommunity, null, 2);
  }

  return files;
}
