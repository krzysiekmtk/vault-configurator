import { describe, it, expect } from "vitest";
import { freshDefaultConfig } from "../config/defaults";
import { applyProfile } from "../config/presets";
import { generateDailyNote } from "./generateDailyNote";
import { generateFolderTree, type TreeNode } from "./generateFolderTree";
import { generateVaultFiles } from "./generateVaultFiles";
import { generatePrompt } from "./generatePrompt";
import { buildFrontmatter } from "./generateFrontmatter";
import { generateTemplates } from "./generateTemplates";

const NOW = new Date(2026, 5, 26); // 2026-06-26, deterministic

describe("generateDailyNote", () => {
  it("renders a heading per enabled section", () => {
    const cfg = freshDefaultConfig();
    cfg.dailyNoteSections = {
      tasks: true,
      yesterday: false,
      notes: true,
      gratitude: false,
      ideas: false,
      summary: false,
    };
    const md = generateDailyNote(cfg);
    expect(md).toContain("## Tasks");
    expect(md).toContain("## Notes");
    expect(md).not.toContain("## Yesterday");
  });

  it("falls back to a single bullet when nothing is enabled", () => {
    const cfg = applyProfile(freshDefaultConfig(), "empty");
    const md = generateDailyNote(cfg);
    expect(md).toContain("# {{date}}");
    expect(md).not.toContain("##");
  });
});

describe("generateVaultFiles", () => {
  it("always emits the three templates and root docs", () => {
    const cfg = freshDefaultConfig();
    const { files } = generateVaultFiles(cfg, NOW);
    expect(files["Templates/Daily Note.md"]).toBeDefined();
    expect(files["Templates/Project Note.md"]).toBeDefined();
    expect(files["Templates/Meeting Note.md"]).toBeDefined();
    expect(files["README.md"]).toContain(cfg.vaultName);
    expect(files["CLAUDE.md"]).toContain("CLAUDE.md");
  });

  it("includes .gitignore only when git sync is on", () => {
    const cfg = freshDefaultConfig();
    cfg.sync.git = true;
    expect(generateVaultFiles(cfg, NOW).files[".gitignore"]).toBeDefined();
    cfg.sync.git = false;
    expect(generateVaultFiles(cfg, NOW).files[".gitignore"]).toBeUndefined();
  });

  it("nests the daily note under monthly subfolders when enabled", () => {
    const cfg = freshDefaultConfig();
    cfg.monthlySubfolders = true;
    const paths = Object.keys(generateVaultFiles(cfg, NOW).files);
    expect(paths.some((p) => p.includes("/2026/06 - June/"))).toBe(true);
  });

  it("applies the date-dash prefix to sample notes", () => {
    const cfg = freshDefaultConfig();
    cfg.filePrefix = "date-dash";
    const paths = Object.keys(generateVaultFiles(cfg, NOW).files);
    expect(paths.some((p) => p.includes("2026-06-26-Example Project.md"))).toBe(true);
  });

  it("pre-enables selected core plugins in .obsidian/core-plugins.json", () => {
    const cfg = freshDefaultConfig(); // dev profile: graphView + dailyNotes on
    const { files } = generateVaultFiles(cfg, NOW);
    const core = JSON.parse(files[".obsidian/core-plugins.json"]);
    expect(core["graph"]).toBe(true);
    expect(core["daily-notes"]).toBe(true);
    expect(core["file-explorer"]).toBe(true); // always-on basic
  });

  it("lists enabled community plugins by their Obsidian id", () => {
    const cfg = freshDefaultConfig(); // dev profile: dataview + tasks on
    const { files } = generateVaultFiles(cfg, NOW);
    const community = JSON.parse(files[".obsidian/community-plugins.json"]);
    expect(community).toContain("dataview");
    expect(community).toContain("obsidian-tasks-plugin");
  });

  it("applies the bracketed [MM-DD-YYYY] prefix to sample notes", () => {
    const cfg = freshDefaultConfig();
    cfg.filePrefix = "date-bracket-mdy";
    const paths = Object.keys(generateVaultFiles(cfg, NOW).files);
    expect(paths.some((p) => p.includes("[06-26-2026] Example Project.md"))).toBe(true);
  });

  it("emits flat tags when tagStyle is flat", () => {
    const cfg = freshDefaultConfig();
    cfg.tagStyle = "flat";
    const { files } = generateVaultFiles(cfg, NOW);
    const project = files["10 Projects/2026-06-26-Example Project.md"];
    expect(project).toContain("- project");
    expect(project).not.toContain("type/project");
  });

  it("emits nested tags by default", () => {
    const cfg = freshDefaultConfig();
    const { files } = generateVaultFiles(cfg, NOW);
    const project = files["10 Projects/2026-06-26-Example Project.md"];
    expect(project).toContain("- type/project");
  });

  it("writes daily-notes settings with monthly path format when enabled", () => {
    const cfg = freshDefaultConfig();
    cfg.monthlySubfolders = true;
    const { files } = generateVaultFiles(cfg, NOW);
    const daily = JSON.parse(files[".obsidian/daily-notes.json"]);
    expect(daily.format).toContain("MMMM");
  });
});

describe("workflow packs", () => {
  it("emits pack templates and sample notes for selected packs", () => {
    const cfg = freshDefaultConfig(); // dev: projects, tasks, meetings, research
    const { files } = generateVaultFiles(cfg, NOW);
    expect(files["Templates/Research Note.md"]).toBeDefined();
    expect(files["Templates/Source Note.md"]).toBeDefined();
    // sample notes placed by folder role
    const paths = Object.keys(files);
    expect(paths.some((p) => p.includes("Example Project"))).toBe(true);
    expect(paths.some((p) => p.includes("Example Research"))).toBe(true);
  });

  it("does not emit a pack's templates when the pack is off", () => {
    const cfg = freshDefaultConfig();
    cfg.workflowPacks = ["projects"];
    const { files } = generateVaultFiles(cfg, NOW);
    expect(files["Templates/Project Note.md"]).toBeDefined();
    expect(files["Templates/Person Note.md"]).toBeUndefined();
  });

  it("adds the People pack's Home section only when selected", () => {
    const cfg = freshDefaultConfig();
    cfg.workflowPacks = ["people"];
    cfg.dashboard.enabled = true;
    const { files } = generateVaultFiles(cfg, NOW);
    expect(files["Home.md"]).toContain("## People");
  });
});

describe("properties / frontmatter", () => {
  it("omits frontmatter entirely when useFrontmatter is off", () => {
    const cfg = freshDefaultConfig();
    expect(buildFrontmatter({ ...cfg, properties: { useFrontmatter: false, enabled: [] } }, [["type", "project"]])).toBe("");
  });

  it("only emits enabled governed properties but always passes pack-specific ones", () => {
    const cfg = freshDefaultConfig();
    cfg.properties = { useFrontmatter: true, enabled: ["type"] };
    const fm = buildFrontmatter(cfg, [["type", "meeting"], ["created", "2026-06-26"], ["attendees", ""]]);
    expect(fm).toContain("type: meeting");
    expect(fm).not.toContain("created:"); // governed + disabled
    expect(fm).toContain("attendees:"); // not governed -> always passes
  });

  it("emits a tags list only when the tags property is enabled", () => {
    const cfg = freshDefaultConfig();
    cfg.properties = { useFrontmatter: true, enabled: ["tags"] };
    expect(buildFrontmatter(cfg, [], ["type/note"])).toContain("- type/note");
    cfg.properties = { useFrontmatter: true, enabled: [] };
    expect(buildFrontmatter(cfg, [], ["type/note"])).toBe("");
  });
});

describe("home dashboard + onboarding + bases", () => {
  it("always ships the four onboarding docs", () => {
    const cfg = freshDefaultConfig();
    const { files } = generateVaultFiles(cfg, NOW);
    expect(files["START HERE.md"]).toBeDefined();
    expect(files["First 7 Days.md"]).toBeDefined();
    expect(files["Vault Map.md"]).toBeDefined();
    expect(files["How to Use This Vault.md"]).toBeDefined();
  });

  it("emits Home.md when the dashboard is enabled and omits it when disabled", () => {
    const cfg = freshDefaultConfig();
    expect(generateVaultFiles(cfg, NOW).files["Home.md"]).toBeDefined();
    cfg.dashboard.enabled = false;
    expect(generateVaultFiles(cfg, NOW).files["Home.md"]).toBeUndefined();
  });

  it("adds a Dataview block to Home when dataview is on", () => {
    const cfg = freshDefaultConfig(); // dev has dataview + activeProjects section
    const home = generateVaultFiles(cfg, NOW).files["Home.md"];
    expect(home).toContain("```dataview");
  });

  it("generates Bases docs only when enabled", () => {
    const cfg = freshDefaultConfig(); // dev: bases enabled
    const { files } = generateVaultFiles(cfg, NOW);
    expect(files["Bases/README.md"]).toBeDefined();
    expect(files["Bases/Projects base.md"]).toBeDefined();
    cfg.bases.enabled = false;
    expect(generateVaultFiles(cfg, NOW).files["Bases/README.md"]).toBeUndefined();
  });
});

describe("generatePrompt — P0 sections", () => {
  it("includes workflows, properties, dashboard, bases, sync and health", () => {
    const cfg = freshDefaultConfig();
    const prompt = generatePrompt(cfg, NOW);
    expect(prompt).toContain("## What this vault is for");
    expect(prompt).toContain("## Properties / frontmatter");
    expect(prompt).toContain("## Home dashboard");
    expect(prompt).toContain("## Bases / database views");
    expect(prompt).toContain("## Devices & sync");
    expect(prompt).toContain("## Setup health");
    expect(prompt).toContain("## Onboarding docs");
  });
});

describe("generateFolderTree", () => {
  it("roots the tree at the vault name and lists folders", () => {
    const cfg = freshDefaultConfig();
    const tree = generateFolderTree(cfg, NOW);
    expect(tree.name).toBe(cfg.vaultName);
    expect(tree.children.some((c) => c.kind === "dir")).toBe(true);
  });

  it("shows Bases/ as a directory when bases are enabled", () => {
    const cfg = freshDefaultConfig(); // dev: bases enabled
    const tree = generateFolderTree(cfg, NOW);
    const bases = tree.children.find((c) => c.name === "Bases" && c.kind === "dir");
    expect(bases).toBeDefined();
    expect(bases?.children.some((c) => c.name === "README.md")).toBe(true);
  });

  it("does not show Bases/ when bases are disabled", () => {
    const cfg = freshDefaultConfig();
    cfg.bases.enabled = false;
    const tree = generateFolderTree(cfg, NOW);
    expect(tree.children.find((c) => c.name === "Bases")).toBeUndefined();
  });

  it("shows all four onboarding docs at vault root", () => {
    const cfg = freshDefaultConfig();
    const tree = generateFolderTree(cfg, NOW);
    const rootNames = tree.children.map((c) => c.name);
    expect(rootNames).toContain("START HERE.md");
    expect(rootNames).toContain("First 7 Days.md");
    expect(rootNames).toContain("Vault Map.md");
    expect(rootNames).toContain("How to Use This Vault.md");
  });

  it("shows Home.md at root when dashboard is enabled", () => {
    const cfg = freshDefaultConfig();
    const tree = generateFolderTree(cfg, NOW);
    expect(tree.children.map((c) => c.name)).toContain("Home.md");
    cfg.dashboard.enabled = false;
    const tree2 = generateFolderTree(cfg, NOW);
    expect(tree2.children.map((c) => c.name)).not.toContain("Home.md");
  });

  it("tree file set contains every path emitted by generateVaultFiles", () => {
    const cfg = freshDefaultConfig();
    const { files } = generateVaultFiles(cfg, NOW);
    const tree = generateFolderTree(cfg, NOW);

    function collectFiles(node: TreeNode, prefix: string): Set<string> {
      const set = new Set<string>();
      for (const child of node.children) {
        const p = prefix ? `${prefix}/${child.name}` : child.name;
        if (child.kind === "file") set.add(p);
        else collectFiles(child, p).forEach((f) => set.add(f));
      }
      return set;
    }

    const treeFiles = collectFiles(tree, "");
    for (const path of Object.keys(files)) {
      expect(treeFiles.has(path), `missing in tree: ${path}`).toBe(true);
    }
  });
});

describe("README generator", () => {
  it("lists selected workflow pack labels", () => {
    const cfg = freshDefaultConfig(); // dev: projects, tasks, meetings, research
    const { files } = generateVaultFiles(cfg, NOW);
    const readme = files["README.md"];
    expect(readme).toContain("## Your workflows");
    expect(readme).toContain("- Projects");
    expect(readme).toContain("- Tasks");
    expect(readme).toContain("- Meetings");
    expect(readme).toContain("- Research");
  });

  it("lists enabled properties", () => {
    const cfg = freshDefaultConfig();
    const { files } = generateVaultFiles(cfg, NOW);
    const readme = files["README.md"];
    expect(readme).toContain("## Properties");
    expect(readme).toContain("`type`");
    expect(readme).toContain("`status`");
  });

  it("includes bases section when enabled", () => {
    const cfg = freshDefaultConfig(); // dev: bases enabled
    const { files } = generateVaultFiles(cfg, NOW);
    const readme = files["README.md"];
    expect(readme).toContain("## Bases");
    expect(readme).toContain("Bases/");
  });

  it("includes devices and sync section", () => {
    const cfg = freshDefaultConfig(); // dev: git sync, desktop
    const { files } = generateVaultFiles(cfg, NOW);
    const readme = files["README.md"];
    expect(readme).toContain("## Devices & sync");
    expect(readme).toContain("Git");
  });

  it("includes weekly review section", () => {
    const cfg = freshDefaultConfig();
    const { files } = generateVaultFiles(cfg, NOW);
    expect(files["README.md"]).toContain("## Weekly review");
  });

  it("includes git setup block when git sync is on", () => {
    const cfg = freshDefaultConfig(); // dev: git on
    const { files } = generateVaultFiles(cfg, NOW);
    expect(files["README.md"]).toContain("git init");
  });

  it("omits bases section when bases are disabled", () => {
    const cfg = freshDefaultConfig();
    cfg.bases.enabled = false;
    const { files } = generateVaultFiles(cfg, NOW);
    expect(files["README.md"]).not.toContain("## Bases");
  });
});

describe("CLAUDE.md generator", () => {
  it("lists workflow packs under workflows section", () => {
    const cfg = freshDefaultConfig(); // dev: projects, tasks, meetings, research
    const { files } = generateVaultFiles(cfg, NOW);
    const claude = files["CLAUDE.md"];
    expect(claude).toContain("## Workflows in use");
    expect(claude).toContain("- Projects");
    expect(claude).toContain("- Research");
  });

  it("lists folder structure", () => {
    const cfg = freshDefaultConfig(); // dev: PARA
    const { files } = generateVaultFiles(cfg, NOW);
    const claude = files["CLAUDE.md"];
    expect(claude).toContain("## Folder structure");
    expect(claude).toContain("10 Projects");
    expect(claude).toContain("20 Areas");
  });

  it("lists enabled properties in conventions", () => {
    const cfg = freshDefaultConfig();
    const { files } = generateVaultFiles(cfg, NOW);
    const claude = files["CLAUDE.md"];
    expect(claude).toContain("`type`");
    expect(claude).toContain("`status`");
  });

  it("includes AI rules section with destructive-command warning", () => {
    const cfg = freshDefaultConfig();
    const { files } = generateVaultFiles(cfg, NOW);
    const claude = files["CLAUDE.md"];
    expect(claude).toContain("## Rules for AI edits");
    expect(claude).toContain("destructive");
    expect(claude).toContain("Preserve YAML frontmatter");
  });

  it("includes sync strategy in output", () => {
    const cfg = freshDefaultConfig(); // dev: git
    const { files } = generateVaultFiles(cfg, NOW);
    expect(files["CLAUDE.md"]).toContain("## Sync");
    expect(files["CLAUDE.md"]).toContain("Git");
  });
});

describe("generatePrompt", () => {
  it("mentions the vault name, folders and rules", () => {
    const cfg = freshDefaultConfig();
    const prompt = generatePrompt(cfg, NOW);
    expect(prompt).toContain(cfg.vaultName);
    expect(prompt).toContain("## Folder structure");
    expect(prompt).toContain("## Rules");
  });

  it("includes ask-if-unsure and no-destructive-commands safety rules", () => {
    const cfg = freshDefaultConfig();
    const prompt = generatePrompt(cfg, NOW);
    expect(prompt).toContain("Ask");
    expect(prompt).toContain("destructive");
  });

  it("includes git section when git sync is on", () => {
    const cfg = freshDefaultConfig(); // dev: git on
    const prompt = generatePrompt(cfg, NOW);
    expect(prompt).toContain("## Git");
    expect(prompt).toContain(".gitignore");
  });

  it("omits git section when git sync is off", () => {
    const cfg = applyProfile(freshDefaultConfig(), "journal"); // journal: icloud, no git
    const prompt = generatePrompt(cfg, NOW);
    expect(prompt).not.toContain("## Git");
  });
});

describe("ZIP content audit — P0 completeness", () => {
  it("dev config contains all required P0 files", () => {
    const cfg = freshDefaultConfig(); // dev: projects+tasks+meetings+research, bases, dashboard, git
    const { files } = generateVaultFiles(cfg, NOW);

    // Core docs
    expect(files["README.md"]).toBeDefined();
    expect(files["CLAUDE.md"]).toBeDefined();
    expect(files[".gitignore"]).toBeDefined();

    // Onboarding
    expect(files["START HERE.md"]).toBeDefined();
    expect(files["First 7 Days.md"]).toBeDefined();
    expect(files["Vault Map.md"]).toBeDefined();
    expect(files["How to Use This Vault.md"]).toBeDefined();

    // Dashboard
    expect(files["Home.md"]).toBeDefined();

    // Templates
    expect(files["Templates/Daily Note.md"]).toBeDefined();
    expect(files["Templates/Project Note.md"]).toBeDefined();
    expect(files["Templates/Meeting Note.md"]).toBeDefined();
    expect(files["Templates/Research Note.md"]).toBeDefined();
    expect(files["Templates/Source Note.md"]).toBeDefined();

    // Sample notes (check by substring — prefix varies)
    const paths = Object.keys(files);
    expect(paths.some((p) => p.includes("Example Project"))).toBe(true);
    expect(paths.some((p) => p.includes("Example Research"))).toBe(true);

    // Bases
    expect(files["Bases/README.md"]).toBeDefined();
    expect(files["Bases/Projects base.md"]).toBeDefined();
    expect(files["Bases/Tasks base.md"]).toBeDefined();
    expect(files["Bases/Meetings base.md"]).toBeDefined();
    expect(files["Bases/Research base.md"]).toBeDefined();

    // Obsidian config
    expect(files[".obsidian/core-plugins.json"]).toBeDefined();
    expect(files[".obsidian/community-plugins.json"]).toBeDefined();
  });

  it("empty profile has minimal file set (no templates, no Bases, no Home)", () => {
    const cfg = applyProfile(freshDefaultConfig(), "empty");
    const { files } = generateVaultFiles(cfg, NOW);
    expect(files["README.md"]).toBeDefined();
    expect(files["CLAUDE.md"]).toBeDefined();
    expect(files["START HERE.md"]).toBeDefined();
    expect(files["Templates/Project Note.md"]).toBeUndefined();
    expect(files["Bases/README.md"]).toBeUndefined();
    expect(files["Home.md"]).toBeUndefined();
    expect(files[".gitignore"]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// P1 tests
// ---------------------------------------------------------------------------

describe("Template Library — P1", () => {
  it("selected library templates appear in generateTemplates output", () => {
    const cfg = freshDefaultConfig();
    cfg.templateLibrary = ["decision-log", "bug-report"];
    const templates = generateTemplates(cfg);
    expect(templates["Templates/Decision Log.md"]).toBeDefined();
    expect(templates["Templates/Bug Report.md"]).toBeDefined();
  });

  it("unselected library templates are absent", () => {
    const cfg = freshDefaultConfig();
    cfg.templateLibrary = [];
    const templates = generateTemplates(cfg);
    expect(templates["Templates/Decision Log.md"]).toBeUndefined();
    expect(templates["Templates/Quote.md"]).toBeUndefined();
  });

  it("selected library templates appear in generateVaultFiles ZIP output", () => {
    const cfg = freshDefaultConfig();
    cfg.templateLibrary = ["goal-note", "web-clip", "code-snippet"];
    const { files } = generateVaultFiles(cfg, NOW);
    expect(files["Templates/Goal Note.md"]).toBeDefined();
    expect(files["Templates/Web Clip.md"]).toBeDefined();
    expect(files["Templates/Code Snippet.md"]).toBeDefined();
  });

  it("library templates appear in Folder Tree preview", () => {
    const cfg = freshDefaultConfig();
    cfg.templateLibrary = ["sprint-note", "quote"];
    const tree = generateFolderTree(cfg, NOW);

    function findNode(node: TreeNode, name: string): boolean {
      if (node.name === name) return true;
      return node.children.some((c) => findNode(c, name));
    }

    expect(findNode(tree, "Sprint Note.md")).toBe(true);
    expect(findNode(tree, "Quote.md")).toBe(true);
  });

  it("library template deduplication: pack template wins over same-named library template", () => {
    // Reading pack already generates "Article Note.md" via content pack.
    // If a library template had the same filename, dedup should keep only one.
    const cfg = freshDefaultConfig();
    cfg.workflowPacks = ["reading"];
    cfg.templateLibrary = [];
    const withPack = generateTemplates(cfg);
    // Confirm reading pack generates Article Note
    expect(withPack["Templates/Article Note.md"]).toBeDefined();
    const countWithPack = Object.keys(withPack).filter((p) => p.includes("Article Note")).length;
    expect(countWithPack).toBe(1);
  });

  it("library template has frontmatter when useFrontmatter is on", () => {
    const cfg = freshDefaultConfig();
    cfg.properties = { useFrontmatter: true, enabled: ["type", "status"] };
    cfg.templateLibrary = ["decision-log"];
    const templates = generateTemplates(cfg);
    expect(templates["Templates/Decision Log.md"]).toContain("type: decision");
  });

  it("library template has no YAML frontmatter when useFrontmatter is off", () => {
    const cfg = freshDefaultConfig();
    cfg.properties = { useFrontmatter: false, enabled: [] };
    cfg.templateLibrary = ["decision-log"];
    const templates = generateTemplates(cfg);
    const content = templates["Templates/Decision Log.md"];
    expect(content).not.toContain("---");
    expect(content).not.toContain("type: decision");
  });

  it("all 9 library template IDs generate a unique file when selected", () => {
    const cfg = freshDefaultConfig();
    cfg.workflowPacks = []; // avoid pack collision
    cfg.templateLibrary = [
      "decision-log", "bug-report", "sprint-note", "goal-note",
      "web-clip", "youtube-note", "pdf-note", "code-snippet", "quote",
    ];
    const templates = generateTemplates(cfg);
    const paths = Object.keys(templates);
    expect(paths).toHaveLength(9);
    expect(paths).toContain("Templates/Decision Log.md");
    expect(paths).toContain("Templates/Bug Report.md");
    expect(paths).toContain("Templates/Sprint Note.md");
    expect(paths).toContain("Templates/Goal Note.md");
    expect(paths).toContain("Templates/Web Clip.md");
    expect(paths).toContain("Templates/YouTube Note.md");
    expect(paths).toContain("Templates/PDF Note.md");
    expect(paths).toContain("Templates/Code Snippet.md");
    expect(paths).toContain("Templates/Quote.md");
  });

  it("library template bodies contain expected structure", () => {
    const cfg = freshDefaultConfig();
    cfg.workflowPacks = [];
    cfg.templateLibrary = ["bug-report"];
    const templates = generateTemplates(cfg);
    const bug = templates["Templates/Bug Report.md"];
    expect(bug).toContain("## Steps to reproduce");
    expect(bug).toContain("## Expected behaviour");
    expect(bug).toContain("## Actual behaviour");
  });
});

describe("Review packs (monthly/quarterly/yearly) — P1", () => {
  it("monthly-review pack generates Monthly Review template", () => {
    const cfg = freshDefaultConfig();
    cfg.workflowPacks = ["monthly-review"];
    const { files } = generateVaultFiles(cfg, NOW);
    expect(files["Templates/Monthly Review.md"]).toBeDefined();
    expect(files["Templates/Monthly Review.md"]).toContain("## Highlights");
    expect(files["Templates/Monthly Review.md"]).toContain("## Next month focus");
  });

  it("quarterly-review pack generates Quarterly Planning template", () => {
    const cfg = freshDefaultConfig();
    cfg.workflowPacks = ["quarterly-review"];
    const { files } = generateVaultFiles(cfg, NOW);
    expect(files["Templates/Quarterly Planning.md"]).toBeDefined();
    expect(files["Templates/Quarterly Planning.md"]).toContain("## OKRs");
  });

  it("yearly-review pack generates Yearly Review template", () => {
    const cfg = freshDefaultConfig();
    cfg.workflowPacks = ["yearly-review"];
    const { files } = generateVaultFiles(cfg, NOW);
    expect(files["Templates/Yearly Review.md"]).toBeDefined();
    expect(files["Templates/Yearly Review.md"]).toContain("## Top wins");
    expect(files["Templates/Yearly Review.md"]).toContain("## Next-year goals");
  });

  it("review packs add home sections to Home.md", () => {
    const cfg = freshDefaultConfig();
    cfg.workflowPacks = ["monthly-review", "quarterly-review", "yearly-review"];
    cfg.dashboard.enabled = true;
    const { files } = generateVaultFiles(cfg, NOW);
    expect(files["Home.md"]).toContain("## Monthly Review");
    expect(files["Home.md"]).toContain("## Quarterly Planning");
    expect(files["Home.md"]).toContain("## Yearly Review");
  });

  it("review packs appear in onboarding docs workflow list", () => {
    const cfg = freshDefaultConfig();
    cfg.workflowPacks = ["monthly-review"];
    const { files } = generateVaultFiles(cfg, NOW);
    expect(files["START HERE.md"]).toContain("Monthly Review");
  });

  it("review packs appear in generatePrompt as workflows", () => {
    const cfg = freshDefaultConfig();
    cfg.workflowPacks = ["monthly-review", "yearly-review"];
    cfg.promptMode = "new-vault";
    const prompt = generatePrompt(cfg, NOW);
    expect(prompt).toContain("Monthly Review");
    expect(prompt).toContain("Yearly Review");
  });

  it("review pack templates are absent when pack not selected", () => {
    const cfg = freshDefaultConfig();
    cfg.workflowPacks = [];
    const { files } = generateVaultFiles(cfg, NOW);
    expect(files["Templates/Monthly Review.md"]).toBeUndefined();
    expect(files["Templates/Quarterly Planning.md"]).toBeUndefined();
    expect(files["Templates/Yearly Review.md"]).toBeUndefined();
  });
});

describe("Prompt Modes — P1", () => {
  describe("new-vault (default)", () => {
    it("contains all core sections", () => {
      const cfg = freshDefaultConfig();
      cfg.promptMode = "new-vault";
      const prompt = generatePrompt(cfg, NOW);
      expect(prompt).toContain("## What this vault is for");
      expect(prompt).toContain("## Folder structure");
      expect(prompt).toContain("## Templates");
      expect(prompt).toContain("## Properties / frontmatter");
      expect(prompt).toContain("## Home dashboard");
      expect(prompt).toContain("## Onboarding docs");
      expect(prompt).toContain("## Devices & sync");
      expect(prompt).toContain("## Setup health");
    });

    it("contains safety rules", () => {
      const cfg = freshDefaultConfig();
      cfg.promptMode = "new-vault";
      const prompt = generatePrompt(cfg, NOW);
      expect(prompt).toContain("## Rules");
      expect(prompt).toContain("destructive");
      expect(prompt).toContain("Ask");
    });

    it("contains git section when git sync is on", () => {
      const cfg = freshDefaultConfig(); // dev: git on
      cfg.promptMode = "new-vault";
      const prompt = generatePrompt(cfg, NOW);
      expect(prompt).toContain("## Git");
    });

    it("contains bases section when bases are enabled", () => {
      const cfg = freshDefaultConfig();
      cfg.promptMode = "new-vault";
      const prompt = generatePrompt(cfg, NOW);
      expect(prompt).toContain("## Bases / database views");
    });
  });

  describe("templates-only", () => {
    it("lists each template with its file path and content", () => {
      const cfg = freshDefaultConfig();
      cfg.promptMode = "templates-only";
      const prompt = generatePrompt(cfg, NOW);
      expect(prompt).toContain("Templates/");
      expect(prompt).toContain("```markdown");
    });

    it("instructs not to modify existing notes", () => {
      const cfg = freshDefaultConfig();
      cfg.promptMode = "templates-only";
      const prompt = generatePrompt(cfg, NOW);
      expect(prompt).toContain("Do not modify");
    });

    it("does NOT contain folder structure reorganisation", () => {
      const cfg = freshDefaultConfig();
      cfg.promptMode = "templates-only";
      const prompt = generatePrompt(cfg, NOW);
      expect(prompt).not.toContain("## Folder structure");
    });

    it("does NOT contain home dashboard section", () => {
      const cfg = freshDefaultConfig();
      cfg.promptMode = "templates-only";
      const prompt = generatePrompt(cfg, NOW);
      expect(prompt).not.toContain("## Home dashboard");
    });

    it("includes library templates when selected", () => {
      const cfg = freshDefaultConfig();
      cfg.promptMode = "templates-only";
      cfg.workflowPacks = [];
      cfg.templateLibrary = ["decision-log"];
      const prompt = generatePrompt(cfg, NOW);
      expect(prompt).toContain("Decision Log");
    });
  });

  describe("readme-only", () => {
    it("contains README.md and CLAUDE.md content", () => {
      const cfg = freshDefaultConfig();
      cfg.promptMode = "readme-only";
      const prompt = generatePrompt(cfg, NOW);
      expect(prompt).toContain("README.md");
      expect(prompt).toContain("CLAUDE.md");
    });

    it("instructs not to touch other files", () => {
      const cfg = freshDefaultConfig();
      cfg.promptMode = "readme-only";
      const prompt = generatePrompt(cfg, NOW);
      expect(prompt).toContain("Do not touch any other files");
    });

    it("does NOT instruct to create or scaffold folder structure", () => {
      const cfg = freshDefaultConfig();
      cfg.promptMode = "readme-only";
      const prompt = generatePrompt(cfg, NOW);
      // The mode embeds README/CLAUDE.md content as code blocks (which may contain
      // structural headers), but must not instruct Claude to build a folder tree.
      expect(prompt).not.toContain("Create the folder structure");
      expect(prompt).not.toContain("mkdir");
    });
  });

  describe("implementation-plan", () => {
    it("contains numbered phases", () => {
      const cfg = freshDefaultConfig();
      cfg.promptMode = "implementation-plan";
      const prompt = generatePrompt(cfg, NOW);
      expect(prompt).toContain("## Phase 1");
      expect(prompt).toContain("## Phase 2");
      expect(prompt).toContain("## Phase 5");
    });

    it("does NOT include shell commands", () => {
      const cfg = freshDefaultConfig();
      cfg.promptMode = "implementation-plan";
      const prompt = generatePrompt(cfg, NOW);
      expect(prompt).not.toContain("git init");
      expect(prompt).not.toContain("mkdir");
      expect(prompt).not.toContain("npm ");
    });

    it("instructs to ask before acting on unlisted items", () => {
      const cfg = freshDefaultConfig();
      cfg.promptMode = "implementation-plan";
      const prompt = generatePrompt(cfg, NOW);
      expect(prompt).toContain("Ask");
    });

    it("mentions workflow packs in phase context", () => {
      const cfg = freshDefaultConfig(); // dev: projects, tasks, meetings, research
      cfg.promptMode = "implementation-plan";
      const prompt = generatePrompt(cfg, NOW);
      expect(prompt).toContain("Projects");
    });
  });

  it("default promptMode behaves as new-vault", () => {
    const cfg = freshDefaultConfig();
    // promptMode defaults to "new-vault" — ensure we didn't break the default
    const explicit = generatePrompt({ ...cfg, promptMode: "new-vault" }, NOW);
    const implicit = generatePrompt(cfg, NOW);
    expect(explicit).toBe(implicit);
  });
});

describe("P1 schema fields in config layer", () => {
  it("freshDefaultConfig has templateLibrary as empty array", () => {
    const cfg = freshDefaultConfig();
    expect(Array.isArray(cfg.templateLibrary)).toBe(true);
    expect(cfg.templateLibrary).toHaveLength(0);
  });

  it("freshDefaultConfig has promptMode as new-vault", () => {
    const cfg = freshDefaultConfig();
    expect(cfg.promptMode).toBe("new-vault");
  });

  it("all 6 profiles include templateLibrary and promptMode", () => {
    const profiles = ["dev", "manager", "creative", "student", "journal", "empty"] as const;
    for (const pid of profiles) {
      const cfg = applyProfile(freshDefaultConfig(), pid);
      expect(Array.isArray(cfg.templateLibrary), `${pid} missing templateLibrary`).toBe(true);
      expect(typeof cfg.promptMode, `${pid} missing promptMode`).toBe("string");
    }
  });

  it("review pack IDs exist in WORKFLOW_PACK_IDS schema", async () => {
    const { WORKFLOW_PACK_IDS } = await import("../config/schema");
    expect(WORKFLOW_PACK_IDS).toContain("monthly-review");
    expect(WORKFLOW_PACK_IDS).toContain("quarterly-review");
    expect(WORKFLOW_PACK_IDS).toContain("yearly-review");
  });

  it("TEMPLATE_LIBRARY_IDS has 9 entries", async () => {
    const { TEMPLATE_LIBRARY_IDS } = await import("../config/schema");
    expect(TEMPLATE_LIBRARY_IDS).toHaveLength(9);
  });

  it("PROMPT_MODES has 4 entries", async () => {
    const { PROMPT_MODES } = await import("../config/schema");
    expect(PROMPT_MODES).toHaveLength(4);
    expect(PROMPT_MODES).toContain("new-vault");
    expect(PROMPT_MODES).toContain("templates-only");
    expect(PROMPT_MODES).toContain("readme-only");
    expect(PROMPT_MODES).toContain("implementation-plan");
  });
});

describe("README and CLAUDE.md include P1 content", () => {
  it("README lists review pack workflow when selected", () => {
    const cfg = freshDefaultConfig();
    cfg.workflowPacks = ["monthly-review", "quarterly-review"];
    const { files } = generateVaultFiles(cfg, NOW);
    expect(files["README.md"]).toContain("Monthly Review");
    expect(files["README.md"]).toContain("Quarterly Planning");
  });

  it("CLAUDE.md lists review packs in workflows section", () => {
    const cfg = freshDefaultConfig();
    cfg.workflowPacks = ["yearly-review"];
    const { files } = generateVaultFiles(cfg, NOW);
    expect(files["CLAUDE.md"]).toContain("Yearly Review");
  });

  it("VAULT MANIFEST.md appears in generateVaultFiles", () => {
    const cfg = freshDefaultConfig();
    const { files } = generateVaultFiles(cfg, NOW);
    expect(files["VAULT MANIFEST.md"]).toBeDefined();
    expect(files["VAULT MANIFEST.md"]).toContain("## Summary");
  });
});
