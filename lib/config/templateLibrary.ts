import type { TemplateLibraryId } from "./types";

export interface LibraryTemplate {
  id: TemplateLibraryId;
  label: string;
  description: string;
  filename: string;
  kind: string;
  props: Array<[string, string]>;
  body: string;
}

export const LIBRARY_TEMPLATES: LibraryTemplate[] = [
  {
    id: "decision-log",
    label: "Decision Log",
    description: "Record key decisions with context and rationale.",
    filename: "Decision Log",
    kind: "decision",
    props: [
      ["type", "decision"],
      ["status", "open"],
      ["created", "{{date}}"],
    ],
    body: `# {{title}}\n\n## Context\n\n\n## Decision\n\n\n## Rationale\n\n\n## Alternatives considered\n- \n\n## Consequences\n- \n`,
  },
  {
    id: "bug-report",
    label: "Bug Report",
    description: "Track bugs with steps to reproduce and fix status.",
    filename: "Bug Report",
    kind: "bug",
    props: [
      ["type", "bug"],
      ["severity", "medium"],
      ["status", "open"],
      ["reporter", ""],
      ["created", "{{date}}"],
    ],
    body: `# {{title}}\n\n## Steps to reproduce\n1. \n\n## Expected behaviour\n\n\n## Actual behaviour\n\n\n## Fix\n\n`,
  },
  {
    id: "sprint-note",
    label: "Sprint Note",
    description: "Plan and review a sprint or iteration.",
    filename: "Sprint Note",
    kind: "sprint",
    props: [
      ["type", "sprint"],
      ["sprint", ""],
      ["status", "open"],
      ["created", "{{date}}"],
    ],
    body: `# Sprint {{sprint}}\n\n## Goal\n\n\n## Completed\n- [x] \n\n## Carryover\n- [ ] \n\n## Retrospective\n\n`,
  },
  {
    id: "goal-note",
    label: "Goal Note",
    description: "Define a goal with milestones and progress tracking.",
    filename: "Goal Note",
    kind: "goal",
    props: [
      ["type", "goal"],
      ["status", "active"],
      ["due", ""],
      ["created", "{{date}}"],
    ],
    body: `# {{title}}\n\n## Why this goal\n\n\n## Milestones\n- [ ] \n\n## Progress log\n- \n`,
  },
  {
    id: "web-clip",
    label: "Web Clip",
    description: "Save and annotate web pages.",
    filename: "Web Clip",
    kind: "web-clip",
    props: [
      ["type", "web-clip"],
      ["source", ""],
      ["created", "{{date}}"],
    ],
    body: `# {{title}}\n\n## URL\n\n\n## Summary\n\n\n## Key points\n- \n\n## My notes\n\n`,
  },
  {
    id: "youtube-note",
    label: "YouTube Note",
    description: "Notes for YouTube videos with timestamps.",
    filename: "YouTube Note",
    kind: "youtube-note",
    props: [
      ["type", "youtube-note"],
      ["source", ""],
      ["channel", ""],
      ["created", "{{date}}"],
    ],
    body: `# {{title}}\n\n## Video link\n\n\n## Summary\n\n\n## Timestamps\n- 0:00 — \n\n## Takeaways\n- \n`,
  },
  {
    id: "pdf-note",
    label: "PDF Note",
    description: "Annotate PDFs and documents.",
    filename: "PDF Note",
    kind: "pdf-note",
    props: [
      ["type", "pdf-note"],
      ["source", ""],
      ["created", "{{date}}"],
    ],
    body: `# {{title}}\n\n## Document\n\n\n## Summary\n\n\n## Key points\n- \n\n## Quotes\n> \n`,
  },
  {
    id: "code-snippet",
    label: "Code Snippet",
    description: "Save reusable code with usage notes.",
    filename: "Code Snippet",
    kind: "code-snippet",
    props: [
      ["type", "code-snippet"],
      ["language", ""],
      ["created", "{{date}}"],
    ],
    body: `# {{title}}\n\n## Description\n\n\n## Code\n\`\`\`\n\n\`\`\`\n\n## Usage\n\n\n## Notes\n\n`,
  },
  {
    id: "quote",
    label: "Quote",
    description: "Save meaningful quotes with context.",
    filename: "Quote",
    kind: "quote",
    props: [
      ["type", "quote"],
      ["author", ""],
      ["source", ""],
      ["created", "{{date}}"],
    ],
    body: `# {{title}}\n\n## Quote\n> \n\n## Context\n\n\n## My thoughts\n\n`,
  },
];
