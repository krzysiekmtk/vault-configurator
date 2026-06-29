import type { VaultConfig } from "./types";

export interface PluginPackDef {
  key: string;
  label: string;
  description: string;
  apply: (draft: VaultConfig) => void;
}

export const PLUGIN_PACKS: PluginPackDef[] = [
  {
    key: "minimal-core",
    label: "Minimal Core",
    description: "Daily Notes + Templates only.",
    apply: (d) => {
      d.corePlugins = { dailyNotes: true, templates: true, graphView: false, backlinks: false, bookmarks: false, audioRecorder: false };
      d.communityPlugins = { tasks: false, kanban: false, dataview: false, excalidraw: false, templater: false, calendar: false };
    },
  },
  {
    key: "task-management",
    label: "Task Management",
    description: "Tasks + Kanban + Calendar.",
    apply: (d) => {
      d.corePlugins = { dailyNotes: true, templates: true, graphView: false, backlinks: false, bookmarks: true, audioRecorder: false };
      d.communityPlugins = { tasks: true, kanban: true, dataview: false, excalidraw: false, templater: false, calendar: true };
    },
  },
  {
    key: "research",
    label: "Research",
    description: "Dataview + Templater + Backlinks + Graph.",
    apply: (d) => {
      d.corePlugins = { dailyNotes: true, templates: true, graphView: true, backlinks: true, bookmarks: true, audioRecorder: false };
      d.communityPlugins = { tasks: false, kanban: false, dataview: true, excalidraw: false, templater: true, calendar: false };
    },
  },
  {
    key: "visual-thinking",
    label: "Visual Thinking",
    description: "Excalidraw + Kanban + Graph View.",
    apply: (d) => {
      d.corePlugins = { dailyNotes: false, templates: true, graphView: true, backlinks: false, bookmarks: false, audioRecorder: false };
      d.communityPlugins = { tasks: false, kanban: true, dataview: false, excalidraw: true, templater: false, calendar: false };
    },
  },
  {
    key: "writing",
    label: "Writing",
    description: "Templates + Templater + Audio Recorder.",
    apply: (d) => {
      d.corePlugins = { dailyNotes: true, templates: true, graphView: false, backlinks: false, bookmarks: false, audioRecorder: true };
      d.communityPlugins = { tasks: false, kanban: false, dataview: false, excalidraw: false, templater: true, calendar: false };
    },
  },
  {
    key: "developer",
    label: "Developer",
    description: "Dataview + Templater + Tasks + Graph.",
    apply: (d) => {
      d.corePlugins = { dailyNotes: true, templates: true, graphView: true, backlinks: true, bookmarks: true, audioRecorder: false };
      d.communityPlugins = { tasks: true, kanban: true, dataview: true, excalidraw: false, templater: true, calendar: false };
    },
  },
  {
    key: "mobile-safe",
    label: "Mobile Safe",
    description: "No heavy plugins. Daily Notes + Bookmarks only.",
    apply: (d) => {
      d.corePlugins = { dailyNotes: true, templates: false, graphView: false, backlinks: false, bookmarks: true, audioRecorder: false };
      d.communityPlugins = { tasks: false, kanban: false, dataview: false, excalidraw: false, templater: false, calendar: false };
    },
  },
  {
    key: "power-user",
    label: "Power User",
    description: "Everything on.",
    apply: (d) => {
      d.corePlugins = { dailyNotes: true, templates: true, graphView: true, backlinks: true, bookmarks: true, audioRecorder: true };
      d.communityPlugins = { tasks: true, kanban: true, dataview: true, excalidraw: true, templater: true, calendar: true };
    },
  },
];
