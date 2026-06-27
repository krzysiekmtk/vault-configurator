import type {
  TagGroupKey,
  DailyNoteSectionKey,
  CorePluginKey,
  CommunityPluginKey,
  WorkflowPack,
  PropertyKey,
  BaseView,
  DashboardSection,
  ExperienceLevel,
  Device,
  SyncStrategy,
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

// --- P0 product-layer catalogs (labels/descriptions only; UI maps icons) -----

export const WORKFLOW_PACK_DEFS: { key: WorkflowPack; label: string; description: string }[] = [
  { key: "projects", label: "Projects", description: "Track outcomes with a clear goal and end date." },
  { key: "tasks", label: "Tasks", description: "Capture and review actionable next steps." },
  { key: "meetings", label: "Meetings", description: "Agendas, notes, decisions and action items." },
  { key: "research", label: "Research", description: "Notes, sources and literature you gather." },
  { key: "content", label: "Content", description: "Ideas, drafts and a publishing pipeline." },
  { key: "learning", label: "Learning", description: "Courses, lectures and study notes." },
  { key: "journal", label: "Journal", description: "Daily reflection and personal logging." },
  { key: "people", label: "People / CRM", description: "Contacts, companies and last-touch tracking." },
  { key: "reading", label: "Reading List", description: "Books and articles with status and ratings." },
];

export const PROPERTY_DEFS: { key: PropertyKey; label: string; description: string }[] = [
  { key: "type", label: "type", description: "Note kind (project, meeting, note…)." },
  { key: "status", label: "status", description: "Workflow state (todo, active, done…)." },
  { key: "area", label: "area", description: "Life/work area the note belongs to." },
  { key: "priority", label: "priority", description: "Relative importance." },
  { key: "created", label: "created", description: "Creation date." },
  { key: "updated", label: "updated", description: "Last-updated date." },
  { key: "due", label: "due", description: "Deadline or target date." },
  { key: "source", label: "source", description: "Where the information came from." },
  { key: "rating", label: "rating", description: "Score for books/articles." },
  { key: "owner", label: "owner", description: "Responsible person." },
  { key: "project", label: "project", description: "Linked parent project." },
  { key: "tags", label: "tags", description: "Emit a YAML tags list in frontmatter." },
];

export const BASE_VIEW_DEFS: { key: BaseView; label: string; description: string }[] = [
  { key: "projects", label: "Projects base", description: "Active / waiting / archived projects." },
  { key: "tasks", label: "Tasks base", description: "Open tasks grouped by due and priority." },
  { key: "meetings", label: "Meetings base", description: "Recent meetings by date and project." },
  { key: "research", label: "Research base", description: "Sources and research notes by status." },
  { key: "content", label: "Content base", description: "Content pipeline by stage and channel." },
  { key: "people", label: "People base", description: "Contacts by company and last contact." },
  { key: "reading", label: "Reading base", description: "Reading list by status and rating." },
];

export const DASHBOARD_SECTION_DEFS: { key: DashboardSection; label: string; pack?: WorkflowPack }[] = [
  { key: "quickCapture", label: "Quick capture" },
  { key: "activeProjects", label: "Active projects", pack: "projects" },
  { key: "openTasks", label: "Open tasks", pack: "tasks" },
  { key: "recentMeetings", label: "Recent meetings", pack: "meetings" },
  { key: "readingList", label: "Reading list", pack: "reading" },
  { key: "contentPipeline", label: "Content pipeline", pack: "content" },
  { key: "weeklyReview", label: "Weekly review link" },
];

export const EXPERIENCE_LEVEL_DEFS: { key: ExperienceLevel; label: string; description: string }[] = [
  { key: "beginner", label: "Beginner", description: "New to Obsidian. Keep it lean." },
  { key: "balanced", label: "Balanced", description: "Comfortable with the basics." },
  { key: "power", label: "Power User", description: "Wants every feature on." },
];

export const DEVICE_DEFS: { key: Device; label: string }[] = [
  { key: "desktop", label: "Desktop" },
  { key: "iphone", label: "iPhone" },
  { key: "android", label: "Android" },
  { key: "ipad", label: "iPad" },
  { key: "work", label: "Work computer" },
];

export const SYNC_STRATEGY_DEFS: { key: SyncStrategy; label: string; description: string }[] = [
  { key: "none", label: "None / Manual backup", description: "No sync. Copy the folder yourself." },
  { key: "obsidian-sync", label: "Obsidian Sync", description: "Simplest cross-device option. Paid service." },
  { key: "icloud", label: "iCloud", description: "Great on Apple devices. Watch multi-device conflicts." },
  { key: "git", label: "Git", description: "Powerful for technical users. Weak on mobile." },
  { key: "dropbox-onedrive", label: "Dropbox / OneDrive", description: "Works, but mind temp files and conflicts." },
];
