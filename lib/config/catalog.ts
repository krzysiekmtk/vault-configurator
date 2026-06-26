import type {
  TagGroupKey,
  DailyNoteSectionKey,
  CorePluginKey,
  CommunityPluginKey,
} from "./types";

/**
 * Static domain catalog shared by UI and generators.
 * Keep labels here so a future i18n layer has one place to localize.
 */

export const TAG_GROUPS: Record<TagGroupKey, { label: string; tags: string[] }> = {
  status: { label: "Status", tags: ["#status/todo", "#status/wip", "#status/done"] },
  type: {
    label: "Type",
    tags: ["#type/note", "#type/project", "#type/meeting", "#type/daily"],
  },
  priority: {
    label: "Priority",
    tags: ["#priority/high", "#priority/medium", "#priority/low"],
  },
  area: {
    label: "Area",
    tags: ["#area/work", "#area/personal", "#area/learning"],
  },
};

export const TAG_GROUP_ORDER: TagGroupKey[] = ["status", "type", "priority", "area"];

export const DAILY_SECTIONS: { key: DailyNoteSectionKey; label: string }[] = [
  { key: "tasks", label: "Tasks" },
  { key: "yesterday", label: "Yesterday" },
  { key: "notes", label: "Notes" },
  { key: "gratitude", label: "Gratitude" },
  { key: "ideas", label: "Ideas" },
  { key: "summary", label: "Summary" },
];

// `obsidianId` is the official plugin identifier Obsidian uses in its config
// files (`.obsidian/core-plugins.json`, `.obsidian/community-plugins.json`).
export const CORE_PLUGINS: { key: CorePluginKey; label: string; description: string; obsidianId: string }[] = [
  { key: "dailyNotes", label: "Daily Notes", description: "Create one note per day from a template.", obsidianId: "daily-notes" },
  { key: "templates", label: "Templates", description: "Insert reusable note templates.", obsidianId: "templates" },
  { key: "graphView", label: "Graph View", description: "Visualize links between notes.", obsidianId: "graph" },
  { key: "backlinks", label: "Backlinks", description: "See notes that link to the current one.", obsidianId: "backlink" },
  { key: "bookmarks", label: "Bookmarks", description: "Pin important notes and searches.", obsidianId: "bookmarks" },
  { key: "audioRecorder", label: "Audio Recorder", description: "Record voice memos into a note.", obsidianId: "audio-recorder" },
];

export const COMMUNITY_PLUGINS: { key: CommunityPluginKey; label: string; description: string; obsidianId: string }[] = [
  { key: "tasks", label: "Tasks", description: "Query and manage checkboxes across the vault.", obsidianId: "obsidian-tasks-plugin" },
  { key: "kanban", label: "Kanban", description: "Markdown-backed kanban boards.", obsidianId: "obsidian-kanban" },
  { key: "dataview", label: "Dataview", description: "Query notes like a database.", obsidianId: "dataview" },
  { key: "excalidraw", label: "Excalidraw", description: "Hand-drawn sketches and diagrams.", obsidianId: "obsidian-excalidraw-plugin" },
  { key: "templater", label: "Templater", description: "Powerful scripted templates.", obsidianId: "templater-obsidian" },
  { key: "calendar", label: "Calendar", description: "Calendar view for daily notes.", obsidianId: "calendar" },
];
