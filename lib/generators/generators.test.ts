import { describe, it, expect } from "vitest";
import { freshDefaultConfig } from "../config/defaults";
import { applyProfile } from "../config/presets";
import { generateDailyNote } from "./generateDailyNote";
import { generateFolderTree } from "./generateFolderTree";
import { generateVaultFiles } from "./generateVaultFiles";
import { generatePrompt } from "./generatePrompt";

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
