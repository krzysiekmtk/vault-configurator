import { z } from "zod";
import {
  vaultConfigSchema,
  profileSchema,
  folderPresetSchema,
  filePrefixSchema,
  tagStyleSchema,
  tagConfigSchema,
  dailyNoteSectionsSchema,
  corePluginsSchema,
  communityPluginsSchema,
  syncConfigSchema,
  workflowPackSchema,
  propertyKeySchema,
  baseViewSchema,
  dashboardSectionSchema,
  experienceLevelSchema,
  deviceSchema,
  syncStrategySchema,
  propertiesConfigSchema,
  basesConfigSchema,
  dashboardConfigSchema,
} from "./schema";

export type VaultConfig = z.infer<typeof vaultConfigSchema>;
export type ProfileId = z.infer<typeof profileSchema>;
export type FolderPreset = z.infer<typeof folderPresetSchema>;
export type FilePrefix = z.infer<typeof filePrefixSchema>;
export type TagStyle = z.infer<typeof tagStyleSchema>;
export type TagConfig = z.infer<typeof tagConfigSchema>;
export type DailyNoteSections = z.infer<typeof dailyNoteSectionsSchema>;
export type CorePlugins = z.infer<typeof corePluginsSchema>;
export type CommunityPlugins = z.infer<typeof communityPluginsSchema>;
export type SyncConfig = z.infer<typeof syncConfigSchema>;

export type WorkflowPack = z.infer<typeof workflowPackSchema>;
export type PropertyKey = z.infer<typeof propertyKeySchema>;
export type BaseView = z.infer<typeof baseViewSchema>;
export type DashboardSection = z.infer<typeof dashboardSectionSchema>;
export type ExperienceLevel = z.infer<typeof experienceLevelSchema>;
export type Device = z.infer<typeof deviceSchema>;
export type SyncStrategy = z.infer<typeof syncStrategySchema>;
export type PropertiesConfig = z.infer<typeof propertiesConfigSchema>;
export type BasesConfig = z.infer<typeof basesConfigSchema>;
export type DashboardConfig = z.infer<typeof dashboardConfigSchema>;

export type CorePluginKey = keyof CorePlugins;
export type CommunityPluginKey = keyof CommunityPlugins;
export type TagGroupKey = "status" | "type" | "priority" | "area";
export type DailyNoteSectionKey = keyof DailyNoteSections;
