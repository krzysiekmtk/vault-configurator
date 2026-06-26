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

export const FILE_PREFIXES = ["none", "date-dash", "date-compact", "type"] as const;

export const profileSchema = z.enum(PROFILE_IDS);
export const folderPresetSchema = z.enum(FOLDER_PRESETS);
export const filePrefixSchema = z.enum(FILE_PREFIXES);

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
  tags: tagConfigSchema,
  dailyNoteSections: dailyNoteSectionsSchema,
  corePlugins: corePluginsSchema,
  communityPlugins: communityPluginsSchema,
  sync: syncConfigSchema,
});
