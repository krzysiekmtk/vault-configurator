import type { VaultConfig } from "../config/types";
import { CORE_PLUGINS, COMMUNITY_PLUGINS, TAG_GROUP_ORDER } from "../config/catalog";
import { resolveFolders } from "../generators/helpers";

export type HealthLevel = "Low" | "Medium" | "High";

export interface VaultHealth {
  complexity: HealthLevel;
  beginnerFriendliness: HealthLevel;
  mobileRisk: HealthLevel;
  pluginDependency: HealthLevel;
  maintenanceEffort: HealthLevel;
  recommendations: string[];
}

const HEAVY_PLUGINS = ["dataview", "templater", "kanban", "excalidraw"] as const;
const DEPENDENCY_PLUGINS = ["tasks", "dataview", "templater", "kanban", "excalidraw"] as const;

function level(score: number, lowMax: number, medMax: number): HealthLevel {
  if (score <= lowMax) return "Low";
  if (score <= medMax) return "Medium";
  return "High";
}

/**
 * Heuristic scoring of a config's complexity and trade-offs. Pure and
 * deterministic so the UI panel, README and prompt stay in sync. Experience
 * level only colors the recommendations — it never changes the user's config.
 */
export function calculateVaultHealth(config: VaultConfig): VaultHealth {
  const coreCount = CORE_PLUGINS.filter((p) => config.corePlugins[p.key]).length;
  const communityCount = COMMUNITY_PLUGINS.filter((p) => config.communityPlugins[p.key]).length;
  const tagGroupsOn = TAG_GROUP_ORDER.filter((k) => config.tags[k]).length;
  const customTags = config.tags.custom.length;
  const propsEnabled = config.properties.useFrontmatter ? config.properties.enabled.length : 0;
  const packs = config.workflowPacks.length;
  const folderCount = resolveFolders(config).length;
  const heavyCount = HEAVY_PLUGINS.filter((p) => config.communityPlugins[p]).length;
  const depCount = DEPENDENCY_PLUGINS.filter((p) => config.communityPlugins[p]).length;
  const customFolders = config.folderPreset === "custom" ? config.customFolders.length : 0;
  const mobile = config.devices.some((d) => d === "iphone" || d === "android" || d === "ipad");

  const complexityScore =
    packs +
    communityCount * 2 +
    coreCount * 0.5 +
    tagGroupsOn * 0.5 +
    customTags * 0.25 +
    (propsEnabled >= 10 ? 2 : propsEnabled >= 5 ? 1 : 0) +
    (config.bases.enabled ? 1 + config.bases.views.length * 0.5 : 0) +
    (config.dashboard.enabled ? 0.5 : 0) +
    (customFolders > 8 ? 2 : customFolders > 5 ? 1 : 0);
  const complexity = level(complexityScore, 5, 10);

  const unfriendliness =
    communityCount +
    (propsEnabled > 8 ? 2 : 0) +
    (packs > 4 ? 2 : 0) +
    (complexity === "High" ? 2 : 0);
  const beginnerFriendliness: HealthLevel =
    unfriendliness <= 2 ? "High" : unfriendliness <= 5 ? "Medium" : "Low";

  const mobileScore =
    heavyCount * 2 + (communityCount > 4 ? 1 : 0) + (config.syncStrategy === "git" ? 2 : 0);
  const mobileRisk = level(mobileScore, 1, 4);

  const pluginDependency = level(depCount, 1, 3);

  const maintenanceScore =
    folderCount * 0.3 +
    propsEnabled * 0.2 +
    packs * 0.5 +
    (config.bases.enabled ? config.bases.views.length * 0.3 : 0) +
    (config.dashboard.enabled ? 0.5 : 0);
  const maintenanceEffort = level(maintenanceScore, 3, 6);

  const recommendations: string[] = [];
  recommendations.push(
    complexity === "High"
      ? "This is a rich setup. If you are new, switch a few things off and grow into it."
      : "This setup is balanced for daily use.",
  );
  if (packs > 4) {
    recommendations.push("You selected many workflow packs. Start with 2–3 if you are new to Obsidian.");
  }
  if (mobile && mobileRisk === "High") {
    recommendations.push("Heavy plugins can be slow or unsupported on mobile. Test on your phone early.");
  }
  if (mobile && config.communityPlugins.excalidraw) {
    recommendations.push("Consider disabling Excalidraw on mobile devices.");
  }
  if (pluginDependency === "High") {
    recommendations.push("Your notes depend on community plugins — install them before queries work.");
  }
  if (config.experienceLevel === "beginner") {
    recommendations.push("Beginner mode: keep plugins and properties minimal until the basics feel natural.");
  } else if (config.experienceLevel === "power") {
    recommendations.push("Power user: push further with Bases views and Dataview dashboards.");
  }

  return {
    complexity,
    beginnerFriendliness,
    mobileRisk,
    pluginDependency,
    maintenanceEffort,
    recommendations,
  };
}
