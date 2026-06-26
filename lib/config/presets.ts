import type {
  VaultConfig,
  ProfileId,
  FolderPreset,
} from "./types";

/** Folder lists for each structure preset. `custom` is user-driven. */
export const FOLDER_PRESET_TREES: Record<Exclude<FolderPreset, "custom">, string[]> = {
  minimal: ["Inbox", "Notes", "Templates"],
  standard: [
    "00 Inbox",
    "10 Projects",
    "20 Areas",
    "30 Resources",
    "40 Archive",
    "Templates",
    "Daily",
  ],
  para: [
    "00 Inbox",
    "10 Projects",
    "20 Areas",
    "30 Resources",
    "40 Archive",
    "Templates",
    "Daily",
  ],
};

/** The part of a config that a profile controls (everything except its own id + vault name). */
export type ProfileConfig = Omit<VaultConfig, "profile" | "vaultName">;

export const PROFILE_LABELS: Record<ProfileId, string> = {
  dev: "Dev",
  manager: "Manager",
  creative: "Creative",
  student: "Student",
  journal: "Journal",
  empty: "Empty",
};

export const PROFILE_DESCRIPTIONS: Record<ProfileId, string> = {
  dev: "PARA structure, task tracking, code-ready templates and Git sync.",
  manager: "Standard structure tuned for meetings, projects and people.",
  creative: "Visual-first vault for ideas, drafts and inspiration.",
  student: "Course-oriented structure with notes, assignments and reviews.",
  journal: "Minimal daily-journaling setup focused on reflection.",
  empty: "A clean slate — almost everything off. Start from scratch.",
};

const EMPTY_PROFILE: ProfileConfig = {
  folderPreset: "minimal",
  customFolders: [],
  monthlySubfolders: false,
  filePrefix: "none",
  tags: { status: false, type: false, priority: false, area: false, custom: [] },
  dailyNoteSections: {
    tasks: false,
    yesterday: false,
    notes: false,
    gratitude: false,
    ideas: false,
    summary: false,
  },
  corePlugins: {
    dailyNotes: false,
    templates: false,
    graphView: false,
    backlinks: false,
    bookmarks: false,
    audioRecorder: false,
  },
  communityPlugins: {
    tasks: false,
    kanban: false,
    dataview: false,
    excalidraw: false,
    templater: false,
    calendar: false,
  },
  sync: { git: false, icloud: false },
};

export const PROFILE_PRESETS: Record<ProfileId, ProfileConfig> = {
  dev: {
    folderPreset: "para",
    customFolders: [],
    monthlySubfolders: true,
    filePrefix: "date-dash",
    tags: { status: true, type: true, priority: true, area: true, custom: [] },
    dailyNoteSections: {
      tasks: true,
      yesterday: true,
      notes: true,
      gratitude: false,
      ideas: true,
      summary: true,
    },
    corePlugins: {
      dailyNotes: true,
      templates: true,
      graphView: true,
      backlinks: true,
      bookmarks: true,
      audioRecorder: false,
    },
    communityPlugins: {
      tasks: true,
      kanban: true,
      dataview: true,
      excalidraw: false,
      templater: true,
      calendar: false,
    },
    sync: { git: true, icloud: false },
  },
  manager: {
    folderPreset: "standard",
    customFolders: [],
    monthlySubfolders: true,
    filePrefix: "type",
    tags: { status: true, type: true, priority: true, area: true, custom: [] },
    dailyNoteSections: {
      tasks: true,
      yesterday: true,
      notes: true,
      gratitude: false,
      ideas: false,
      summary: true,
    },
    corePlugins: {
      dailyNotes: true,
      templates: true,
      graphView: true,
      backlinks: true,
      bookmarks: true,
      audioRecorder: false,
    },
    communityPlugins: {
      tasks: true,
      kanban: true,
      dataview: true,
      excalidraw: false,
      templater: false,
      calendar: true,
    },
    sync: { git: false, icloud: true },
  },
  creative: {
    folderPreset: "standard",
    customFolders: [],
    monthlySubfolders: false,
    filePrefix: "none",
    tags: { status: true, type: true, priority: false, area: true, custom: ["ideas", "drafts"] },
    dailyNoteSections: {
      tasks: false,
      yesterday: false,
      notes: true,
      gratitude: false,
      ideas: true,
      summary: true,
    },
    corePlugins: {
      dailyNotes: true,
      templates: true,
      graphView: true,
      backlinks: true,
      bookmarks: true,
      audioRecorder: true,
    },
    communityPlugins: {
      tasks: false,
      kanban: true,
      dataview: false,
      excalidraw: true,
      templater: true,
      calendar: false,
    },
    sync: { git: false, icloud: false },
  },
  student: {
    folderPreset: "standard",
    customFolders: [],
    monthlySubfolders: true,
    filePrefix: "date-dash",
    tags: { status: true, type: true, priority: true, area: true, custom: ["exam", "lecture"] },
    dailyNoteSections: {
      tasks: true,
      yesterday: false,
      notes: true,
      gratitude: false,
      ideas: true,
      summary: true,
    },
    corePlugins: {
      dailyNotes: true,
      templates: true,
      graphView: true,
      backlinks: true,
      bookmarks: false,
      audioRecorder: true,
    },
    communityPlugins: {
      tasks: true,
      kanban: false,
      dataview: true,
      excalidraw: true,
      templater: false,
      calendar: true,
    },
    sync: { git: false, icloud: true },
  },
  journal: {
    folderPreset: "minimal",
    customFolders: [],
    monthlySubfolders: true,
    filePrefix: "date-dash",
    tags: { status: true, type: true, priority: false, area: false, custom: [] },
    dailyNoteSections: {
      tasks: false,
      yesterday: false,
      notes: true,
      gratitude: true,
      ideas: true,
      summary: true,
    },
    corePlugins: {
      dailyNotes: true,
      templates: true,
      graphView: false,
      backlinks: true,
      bookmarks: false,
      audioRecorder: false,
    },
    communityPlugins: {
      tasks: false,
      kanban: false,
      dataview: false,
      excalidraw: false,
      templater: false,
      calendar: true,
    },
    sync: { git: false, icloud: true },
  },
  empty: EMPTY_PROFILE,
};

/**
 * Apply a profile preset to a config, preserving the user's vault name.
 * Returns a brand-new object (no mutation).
 */
export function applyProfile(config: VaultConfig, profile: ProfileId): VaultConfig {
  return {
    ...PROFILE_PRESETS[profile],
    profile,
    vaultName: config.vaultName,
  };
}
