import { describe, it, expect } from "vitest";
import { freshDefaultConfig } from "../config/defaults";
import { applyProfile } from "../config/presets";
import { generateDailyNote } from "./generateDailyNote";
import { generateFolderTree } from "./generateFolderTree";
import { generateVaultFiles } from "./generateVaultFiles";
import { generatePrompt } from "./generatePrompt";
import { buildFrontmatter } from "./generateFrontmatter";

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
});

describe("generatePrompt", () => {
  it("mentions the vault name, folders and rules", () => {
    const cfg = freshDefaultConfig();
    const prompt = generatePrompt(cfg, NOW);
    expect(prompt).toContain(cfg.vaultName);
    expect(prompt).toContain("## Folder structure");
    expect(prompt).toContain("## Rules");
  });
});
