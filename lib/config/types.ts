import { z } from "zod";
import {
  vaultConfigSchema,
  profileSchema,
  folderPresetSchema,
  filePrefixSchema,
  tagConfigSchema,
  dailyNoteSectionsSchema,
  corePluginsSchema,
  communityPluginsSchema,
  syncConfigSchema,
} from "./schema";

export type VaultConfig = z.infer<typeof vaultConfigSchema>;
export type ProfileId = z.infer<typeof profileSchema>;
export type FolderPreset = z.infer<typeof folderPresetSchema>;
export type FilePrefix = z.infer<typeof filePrefixSchema>;
export type TagConfig = z.infer<typeof tagConfigSchema>;
export type DailyNoteSections = z.infer<typeof dailyNoteSectionsSchema>;
export type CorePlugins = z.infer<typeof corePluginsSchema>;
export type CommunityPlugins = z.infer<typeof communityPluginsSchema>;
export type SyncConfig = z.infer<typeof syncConfigSchema>;

export type CorePluginKey = keyof CorePlugins;
export type CommunityPluginKey = keyof CommunityPlugins;
export type TagGroupKey = "status" | "type" | "priority" | "area";
export type DailyNoteSectionKey = keyof DailyNoteSections;
