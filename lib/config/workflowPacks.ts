import type { WorkflowPack, BaseView } from "./types";

/**
 * Single source of truth for Workflow Packs.
 *
 * Each pack declares what it contributes to a generated vault: Templates, an
 * optional sample note (placed by folder role, content-only — packs never add
 * folders), an optional Home dashboard section, and a Bases view id.
 *
 * Property values use the `{{date}}` token in templates; sample generators
 * substitute the real date. Scalar props beyond the governed PROPERTY_KEYS set
 * (e.g. `attendees`, `channel`) always pass through — only the generic keys are
 * gated by the Properties toggles. See `generateFrontmatter.ts`.
 */

export interface PackTemplate {
  /** Filename under `Templates/`, without extension. */
  name: string;
  /** Note kind, drives the `type` frontmatter value. */
  kind: string;
  /** Ordered scalar frontmatter props (key, value). */
  props: Array<[string, string]>;
  /** Body markdown that follows the frontmatter. */
  body: string;
}

export interface PackSample {
  /** Folder roles to try, in order; falls back to the first folder, then root. */
  folderRoles: string[];
  /** File base name before any filename prefix is applied. */
  baseName: string;
  /** Note type used by the `type` filename-prefix mode. */
  typeForPrefix: string;
  /** Ordered scalar frontmatter props ({{date}} replaced with the real date). */
  props: Array<[string, string]>;
  /** Tags as nested slugs (styled to nested/flat at generation time). */
  tags: string[];
  /** Body markdown. */
  body: string;
}

export interface PackDef {
  templates: PackTemplate[];
  sample?: PackSample;
  /**
   * Extra Home section for packs not covered by a fixed Dashboard toggle
   * (research / people / learning / journal). Projects/tasks/meetings/reading/
   * content are rendered from the Dashboard section toggles instead.
   */
  homeSection?: { title: string; body: string };
  baseView?: BaseView;
}

export const WORKFLOW_PACKS: Record<WorkflowPack, PackDef> = {
  projects: {
    templates: [
      {
        name: "Project Note",
        kind: "project",
        props: [
          ["type", "project"],
          ["status", "active"],
          ["priority", "medium"],
          ["area", ""],
          ["created", "{{date}}"],
          ["updated", "{{date}}"],
        ],
        body: `# {{title}}\n\n## Goal\n\n\n## Next actions\n- [ ] \n\n## Notes\n\n\n## Related\n`,
      },
    ],
    sample: {
      folderRoles: ["project"],
      baseName: "Example Project",
      typeForPrefix: "project",
      props: [
        ["type", "project"],
        ["status", "active"],
        ["priority", "high"],
        ["created", "{{date}}"],
        ["updated", "{{date}}"],
      ],
      tags: ["type/project"],
      body: `# Example Project\n\nA sample project note showing how your vault is structured.\n\n## Goal\nShip the first version.\n\n## Next actions\n- [ ] Define scope\n- [ ] Build it\n- [x] Set up the vault\n\n## Notes\nLink related notes with [[Useful Links]].\n`,
    },
    baseView: "projects",
  },

  tasks: {
    templates: [],
    baseView: "tasks",
  },

  meetings: {
    templates: [
      {
        name: "Meeting Note",
        kind: "meeting",
        props: [
          ["type", "meeting"],
          ["date", "{{date}}"],
          ["project", ""],
          ["attendees", ""],
          ["created", "{{date}}"],
        ],
        body: `# Meeting - {{date}}\n\n## Agenda\n\n\n## Notes\n\n\n## Decisions\n\n\n## Action items\n- [ ] \n`,
      },
    ],
    sample: {
      folderRoles: ["notes", "area", "resource", "project"],
      baseName: "Example Meeting",
      typeForPrefix: "meeting",
      props: [
        ["type", "meeting"],
        ["date", "{{date}}"],
        ["project", ""],
        ["attendees", ""],
        ["created", "{{date}}"],
      ],
      tags: ["type/meeting"],
      body: `# Meeting - Kickoff\n\n## Agenda\n- Goals\n- Owners\n\n## Notes\n- \n\n## Decisions\n- \n\n## Action items\n- [ ] Follow up\n`,
    },
    baseView: "meetings",
  },

  research: {
    templates: [
      {
        name: "Research Note",
        kind: "research",
        props: [
          ["type", "research"],
          ["source", ""],
          ["status", "open"],
          ["created", "{{date}}"],
        ],
        body: `# {{title}}\n\n## Summary\n\n\n## Key points\n- \n\n## Questions\n- \n\n## Sources\n- \n`,
      },
      {
        name: "Source Note",
        kind: "source",
        props: [
          ["type", "source"],
          ["source", ""],
          ["created", "{{date}}"],
        ],
        body: `# {{title}}\n\n## Reference\n\n\n## Notes\n- \n\n## Quotes\n> \n`,
      },
    ],
    sample: {
      folderRoles: ["resource", "notes", "area"],
      baseName: "Example Research",
      typeForPrefix: "research",
      props: [
        ["type", "research"],
        ["source", ""],
        ["status", "open"],
        ["created", "{{date}}"],
      ],
      tags: ["type/research"],
      body: `# Example Research\n\n## Summary\nA sample research note.\n\n## Key points\n- \n\n## Sources\n- \n`,
    },
    homeSection: {
      title: "Research Notes",
      body: "Collect sources and findings. Keep one note per source.",
    },
    baseView: "research",
  },

  content: {
    templates: [
      {
        name: "Content Idea",
        kind: "content-idea",
        props: [
          ["type", "content-idea"],
          ["status", "idea"],
          ["channel", ""],
          ["publish_date", ""],
          ["created", "{{date}}"],
        ],
        body: `# {{title}}\n\n## Hook\n\n\n## Outline\n- \n\n## Notes\n\n`,
      },
      {
        name: "Article Draft",
        kind: "article",
        props: [
          ["type", "article"],
          ["status", "draft"],
          ["channel", ""],
          ["publish_date", ""],
          ["created", "{{date}}"],
        ],
        body: `# {{title}}\n\n## Intro\n\n\n## Body\n\n\n## Conclusion\n\n`,
      },
    ],
    sample: {
      folderRoles: ["resource", "project", "notes"],
      baseName: "Example Content Idea",
      typeForPrefix: "content",
      props: [
        ["type", "content-idea"],
        ["status", "idea"],
        ["channel", ""],
        ["publish_date", ""],
        ["created", "{{date}}"],
      ],
      tags: ["type/content-idea"],
      body: `# Example Content Idea\n\n## Hook\nA sample content idea.\n\n## Outline\n- \n`,
    },
    baseView: "content",
  },

  learning: {
    templates: [
      {
        name: "Lecture Note",
        kind: "lecture",
        props: [
          ["type", "lecture"],
          ["course", ""],
          ["status", "open"],
          ["created", "{{date}}"],
        ],
        body: `# {{title}}\n\n## Key concepts\n- \n\n## Notes\n\n\n## Questions\n- \n\n## Review\n- [ ] Summarize in my own words\n`,
      },
    ],
    sample: {
      folderRoles: ["resource", "notes", "area"],
      baseName: "Example Lecture",
      typeForPrefix: "lecture",
      props: [
        ["type", "lecture"],
        ["course", ""],
        ["status", "open"],
        ["created", "{{date}}"],
      ],
      tags: ["type/lecture"],
      body: `# Example Lecture\n\n## Key concepts\n- \n\n## Notes\n\n`,
    },
    homeSection: {
      title: "Learning",
      body: "Track courses and lectures. Review notes weekly.",
    },
  },

  journal: {
    templates: [],
    homeSection: {
      title: "Journal",
      body: "Reflect daily. Your entries live in the daily notes.",
    },
  },

  people: {
    templates: [
      {
        name: "Person Note",
        kind: "person",
        props: [
          ["type", "person"],
          ["company", ""],
          ["role", ""],
          ["last_contact", ""],
          ["created", "{{date}}"],
        ],
        body: `# {{title}}\n\n## Context\n\n\n## Interactions\n- \n\n## Follow-ups\n- [ ] \n`,
      },
    ],
    sample: {
      folderRoles: ["area", "resource", "notes"],
      baseName: "Example Person",
      typeForPrefix: "person",
      props: [
        ["type", "person"],
        ["company", ""],
        ["role", ""],
        ["last_contact", ""],
        ["created", "{{date}}"],
      ],
      tags: ["type/person"],
      body: `# Example Person\n\n## Context\nA sample contact note.\n\n## Interactions\n- \n\n## Follow-ups\n- [ ] \n`,
    },
    homeSection: {
      title: "People",
      body: "Keep contacts connected to projects and meetings.",
    },
    baseView: "people",
  },

  reading: {
    templates: [
      {
        name: "Book Note",
        kind: "book",
        props: [
          ["type", "book"],
          ["author", ""],
          ["status", "to-read"],
          ["rating", ""],
          ["created", "{{date}}"],
        ],
        body: `# {{title}}\n\n## Summary\n\n\n## Highlights\n- \n\n## Takeaways\n- \n`,
      },
      {
        name: "Article Note",
        kind: "article",
        props: [
          ["type", "article"],
          ["author", ""],
          ["status", "to-read"],
          ["created", "{{date}}"],
        ],
        body: `# {{title}}\n\n## Summary\n\n\n## Notes\n- \n`,
      },
    ],
    sample: {
      folderRoles: ["resource", "notes", "area"],
      baseName: "Example Book",
      typeForPrefix: "book",
      props: [
        ["type", "book"],
        ["author", ""],
        ["status", "to-read"],
        ["rating", ""],
        ["created", "{{date}}"],
      ],
      tags: ["type/book"],
      body: `# Example Book\n\n## Summary\nA sample book note.\n\n## Highlights\n- \n`,
    },
    baseView: "reading",
  },
};
