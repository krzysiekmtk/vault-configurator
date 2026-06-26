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

export const CORE_PLUGINS: { key: CorePluginKey; label: string; description: string }[] = [
  { key: "dailyNotes", label: "Daily Notes", description: "Create one note per day from a template." },
  { key: "templates", label: "Templates", description: "Insert reusable note templates." },
  { key: "graphView", label: "Graph View", description: "Visualize links between notes." },
  { key: "backlinks", label: "Backlinks", description: "See notes that link to the current one." },
  { key: "bookmarks", label: "Bookmarks", description: "Pin important notes and searches." },
  { key: "audioRecorder", label: "Audio Recorder", description: "Record voice memos into a note." },
];

export const COMMUNITY_PLUGINS: { key: CommunityPluginKey; label: string; description: string }[] = [
  { key: "tasks", label: "Tasks", description: "Query and manage checkboxes across the vault." },
  { key: "kanban", label: "Kanban", description: "Markdown-backed kanban boards." },
  { key: "dataview", label: "Dataview", description: "Query notes like a database." },
  { key: "excalidraw", label: "Excalidraw", description: "Hand-drawn sketches and diagrams." },
  { key: "templater", label: "Templater", description: "Powerful scripted templates." },
  { key: "calendar", label: "Calendar", description: "Calendar view for daily notes." },
];
