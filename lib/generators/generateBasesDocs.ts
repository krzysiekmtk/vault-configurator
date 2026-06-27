import type { VaultConfig, BaseView } from "../config/types";
import { BASE_VIEW_DEFS } from "../config/catalog";
import { resolveFolders, findFolder, type FolderRole } from "./helpers";

const FENCE = "```";

interface ViewSpec {
  type: string;
  filters: string[];
  columns: string[];
  views: string[];
  /** Folder role used as the Dataview FROM source. */
  folderRole: string;
}

const VIEW_SPECS: Record<BaseView, ViewSpec> = {
  projects: {
    type: "project",
    filters: ["type is project", "status is not archived"],
    columns: ["status", "priority", "area", "owner", "due", "updated"],
    views: ["Active Projects", "Waiting", "Archived"],
    folderRole: "project",
  },
  tasks: {
    type: "task",
    filters: ["task is not done"],
    columns: ["due", "priority", "project"],
    views: ["Today", "Upcoming", "No date"],
    folderRole: "project",
  },
  meetings: {
    type: "meeting",
    filters: ["type is meeting"],
    columns: ["date", "project", "attendees"],
    views: ["Recent", "By project"],
    folderRole: "notes",
  },
  research: {
    type: "research",
    filters: ["type is research or type is source"],
    columns: ["status", "source", "created"],
    views: ["Open", "Reviewed"],
    folderRole: "resource",
  },
  content: {
    type: "content",
    filters: ["type is content-idea or type is article"],
    columns: ["status", "channel", "publish_date"],
    views: ["Ideas", "Drafts", "Published"],
    folderRole: "resource",
  },
  people: {
    type: "person",
    filters: ["type is person"],
    columns: ["company", "role", "last_contact"],
    views: ["All", "By company"],
    folderRole: "area",
  },
  reading: {
    type: "book",
    filters: ["type is book or type is article"],
    columns: ["author", "status", "rating"],
    views: ["To read", "Reading", "Finished"],
    folderRole: "resource",
  },
};

function viewDoc(config: VaultConfig, view: BaseView, folder: string | undefined): string {
  const spec = VIEW_SPECS[view];
  const label = BASE_VIEW_DEFS.find((d) => d.key === view)?.label ?? view;
  const lines = [
    `# ${label}`,
    "",
    "## Recommended filters",
    ...spec.filters.map((f) => `- ${f}`),
    "",
    "## Recommended columns",
    ...spec.columns.map((c) => `- ${c}`),
    "",
    "## Recommended views",
    ...spec.views.map((v) => `- ${v}`),
    "",
  ];

  if (config.communityPlugins.dataview && folder) {
    lines.push(
      "## Dataview alternative",
      "",
      "If you use Dataview, this query reproduces the table:",
      "",
      `${FENCE}dataview`,
      `TABLE ${spec.columns.join(", ")}`,
      `FROM "${folder}"`,
      `WHERE type = "${spec.type}"`,
      FENCE,
      "",
    );
  }

  return lines.join("\n");
}

/**
 * Build the `Bases/` documentation. MVP is safe markdown only (no `.base`
 * binary format): a README plus one descriptive note per selected view.
 * Returns {} when Bases is disabled.
 */
export function generateBasesDocs(config: VaultConfig): Record<string, string> {
  if (!config.bases.enabled || config.bases.views.length === 0) return {};

  const folders = resolveFolders(config);
  const files: Record<string, string> = {};

  const readme = [
    "# Bases",
    "",
    "Suggested database-style views for this vault. Each note below describes the",
    "filters, columns and views to recreate in **Obsidian Bases** (Settings →",
    "Core plugins → Bases), or as Dataview queries.",
    "",
    "## Views",
    "",
    ...config.bases.views.map((v) => {
      const label = BASE_VIEW_DEFS.find((d) => d.key === v)?.label ?? v;
      return `- [[${label}]]`;
    }),
    "",
    "> These are recommendations, not generated databases. Recreate them once your",
    "> notes use the matching `type` and properties.",
    "",
  ].join("\n");
  files["Bases/README.md"] = readme;

  for (const view of config.bases.views) {
    const label = BASE_VIEW_DEFS.find((d) => d.key === view)?.label ?? view;
    const folder = findFolder(folders, VIEW_SPECS[view].folderRole as FolderRole);
    files[`Bases/${label}.md`] = viewDoc(config, view, folder);
  }

  return files;
}
