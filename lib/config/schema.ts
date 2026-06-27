import { z } from "zod";

/**
 * Single source of truth for the vault configuration.
 *
 * Everything downstream (generators, preview, ZIP, prompt, share URL,
 * localStorage) derives from this schema. Adding a field here and to
 * `defaults.ts` is enough to thread it through the whole app.
 */

export const PROFILE_IDS = [
  "dev",
  "manager",
  "creative",
  "student",
  "journal",
  "empty",
] as const;

export const FOLDER_PRESETS = ["minimal", "standard", "para", "custom"] as const;

export const FILE_PREFIXES = [
  "none",
  "date-dash",
  "date-compact",
  "date-bracket-mdy",
  "type",
] as const;

export const TAG_STYLES = ["nested", "flat"] as const;

// --- P0 product-layer enums ---------------------------------------------------

export const WORKFLOW_PACK_IDS = [
  "projects",
  "tasks",
  "meetings",
  "research",
  "content",
  "learning",
  "journal",
  "people",
  "reading",
] as const;

export const PROPERTY_KEYS = [
  "type",
  "status",
  "area",
  "priority",
  "created",
  "updated",
  "due",
  "source",
  "rating",
  "owner",
  "project",
  "tags",
] as const;

export const BASE_VIEW_IDS = [
  "projects",
  "tasks",
  "meetings",
  "research",
  "content",
  "people",
  "reading",
] as const;

export const DASHBOARD_SECTIONS = [
  "quickCapture",
  "activeProjects",
  "openTasks",
  "recentMeetings",
  "readingList",
  "contentPipeline",
  "weeklyReview",
] as const;

export const EXPERIENCE_LEVELS = ["beginner", "balanced", "power"] as const;

export const DEVICE_IDS = ["desktop", "iphone", "android", "ipad", "work"] as const;

export const SYNC_STRATEGIES = [
  "none",
  "obsidian-sync",
  "icloud",
  "git",
  "dropbox-onedrive",
] as const;

export const profileSchema = z.enum(PROFILE_IDS);
export const folderPresetSchema = z.enum(FOLDER_PRESETS);
export const filePrefixSchema = z.enum(FILE_PREFIXES);
export const tagStyleSchema = z.enum(TAG_STYLES);
export const workflowPackSchema = z.enum(WORKFLOW_PACK_IDS);
export const propertyKeySchema = z.enum(PROPERTY_KEYS);
export const baseViewSchema = z.enum(BASE_VIEW_IDS);
export const dashboardSectionSchema = z.enum(DASHBOARD_SECTIONS);
export const experienceLevelSchema = z.enum(EXPERIENCE_LEVELS);
export const deviceSchema = z.enum(DEVICE_IDS);
export const syncStrategySchema = z.enum(SYNC_STRATEGIES);

export const propertiesConfigSchema = z.object({
  useFrontmatter: z.boolean(),
  enabled: z.array(propertyKeySchema),
});

export const basesConfigSchema = z.object({
  enabled: z.boolean(),
  views: z.array(baseViewSchema),
});

export const dashboardConfigSchema = z.object({
  enabled: z.boolean(),
  sections: z.array(dashboardSectionSchema),
});

export const tagConfigSchema = z.object({
  status: z.boolean(),
  type: z.boolean(),
  priority: z.boolean(),
  area: z.boolean(),
  custom: z.array(z.string()),
});

export const dailyNoteSectionsSchema = z.object({
  tasks: z.boolean(),
  yesterday: z.boolean(),
  notes: z.boolean(),
  gratitude: z.boolean(),
  ideas: z.boolean(),
  summary: z.boolean(),
});

export const corePluginsSchema = z.object({
  dailyNotes: z.boolean(),
  templates: z.boolean(),
  graphView: z.boolean(),
  backlinks: z.boolean(),
  bookmarks: z.boolean(),
  audioRecorder: z.boolean(),
});

export const communityPluginsSchema = z.object({
  tasks: z.boolean(),
  kanban: z.boolean(),
  dataview: z.boolean(),
  excalidraw: z.boolean(),
  templater: z.boolean(),
  calendar: z.boolean(),
});

export const syncConfigSchema = z.object({
  git: z.boolean(),
  icloud: z.boolean(),
});

export const vaultConfigSchema = z.object({
  profile: profileSchema,
  vaultName: z.string().min(1).max(80),
  folderPreset: folderPresetSchema,
  customFolders: z.array(z.string()),
  monthlySubfolders: z.boolean(),
  filePrefix: filePrefixSchema,
  // `.default` keeps configs saved before this field was added valid on import.
  tagStyle: tagStyleSchema.default("nested"),
  tags: tagConfigSchema,
  dailyNoteSections: dailyNoteSectionsSchema,
  corePlugins: corePluginsSchema,
  communityPlugins: communityPluginsSchema,
  sync: syncConfigSchema,
  // --- P0 product-layer fields. All defaulted so older exports/share URLs
  // (which lack these keys) still parse instead of crashing the app. ---
  workflowPacks: z.array(workflowPackSchema).default([]),
  properties: propertiesConfigSchema.default({
    useFrontmatter: true,
    enabled: [...PROPERTY_KEYS],
  }),
  bases: basesConfigSchema.default({ enabled: false, views: [] }),
  dashboard: dashboardConfigSchema.default({ enabled: true, sections: [] }),
  experienceLevel: experienceLevelSchema.default("balanced"),
  devices: z.array(deviceSchema).default(["desktop"]),
  syncStrategy: syncStrategySchema.default("none"),
});
