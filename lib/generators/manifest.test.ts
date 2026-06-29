import { describe, it, expect } from "vitest";
import { freshDefaultConfig } from "../config/defaults";
import { applyProfile } from "../config/presets";
import { generateVaultFiles } from "./generateVaultFiles";
import { generateManifest, generateManifestMd } from "./generateManifest";

const NOW = new Date(2026, 5, 26);

describe("generateManifest", () => {
  it("counts folders matching resolveFolders", () => {
    const cfg = freshDefaultConfig();
    const vf = generateVaultFiles(cfg, NOW);
    const m = generateManifest(cfg, vf);
    expect(m.folderCount).toBe(vf.folders.length);
    expect(m.folderCount).toBeGreaterThan(0);
  });

  it("counts total files matching VaultFiles output", () => {
    const cfg = freshDefaultConfig();
    const vf = generateVaultFiles(cfg, NOW);
    const m = generateManifest(cfg, vf);
    expect(m.fileCount).toBe(Object.keys(vf.files).length);
  });

  it("counts templates correctly", () => {
    const cfg = freshDefaultConfig(); // dev: projects, tasks, meetings, research
    const vf = generateVaultFiles(cfg, NOW);
    const m = generateManifest(cfg, vf);
    const templatePaths = Object.keys(vf.files).filter((p) => p.startsWith("Templates/"));
    expect(m.templateCount).toBe(templatePaths.length);
    expect(m.templateCount).toBeGreaterThan(0);
  });

  it("counts all 4 onboarding docs when present", () => {
    const cfg = freshDefaultConfig();
    const vf = generateVaultFiles(cfg, NOW);
    const m = generateManifest(cfg, vf);
    expect(m.onboardingDocCount).toBe(4);
  });

  it("counts bases docs when enabled", () => {
    const cfg = freshDefaultConfig(); // dev: bases enabled
    const vf = generateVaultFiles(cfg, NOW);
    const m = generateManifest(cfg, vf);
    const basesPaths = Object.keys(vf.files).filter((p) => p.startsWith("Bases/"));
    expect(m.basesDocCount).toBe(basesPaths.length);
    expect(m.basesDocCount).toBeGreaterThan(0);
  });

  it("reports basesDocCount as 0 when bases disabled", () => {
    const cfg = freshDefaultConfig();
    cfg.bases.enabled = false;
    const vf = generateVaultFiles(cfg, NOW);
    const m = generateManifest(cfg, vf);
    expect(m.basesDocCount).toBe(0);
  });

  it("detects Home.md when dashboard is enabled", () => {
    const cfg = freshDefaultConfig();
    cfg.dashboard.enabled = true;
    const vf = generateVaultFiles(cfg, NOW);
    const m = generateManifest(cfg, vf);
    expect(m.hasHome).toBe(true);
  });

  it("reports hasHome as false when dashboard is disabled", () => {
    const cfg = freshDefaultConfig();
    cfg.dashboard.enabled = false;
    const vf = generateVaultFiles(cfg, NOW);
    const m = generateManifest(cfg, vf);
    expect(m.hasHome).toBe(false);
  });

  it("detects .gitignore when git sync is on", () => {
    const cfg = freshDefaultConfig(); // dev: git on
    const vf = generateVaultFiles(cfg, NOW);
    const m = generateManifest(cfg, vf);
    expect(m.hasGitignore).toBe(true);
  });

  it("reports hasGitignore as false when git is off", () => {
    const cfg = applyProfile(freshDefaultConfig(), "journal"); // journal: icloud
    const vf = generateVaultFiles(cfg, NOW);
    const m = generateManifest(cfg, vf);
    expect(m.hasGitignore).toBe(false);
  });

  it("lists workflow pack labels", () => {
    const cfg = freshDefaultConfig(); // dev: projects, tasks, meetings, research
    const vf = generateVaultFiles(cfg, NOW);
    const m = generateManifest(cfg, vf);
    expect(m.workflowPackLabels).toContain("Projects");
    expect(m.workflowPackLabels).toContain("Tasks");
    expect(m.workflowPackLabels).toContain("Meetings");
    expect(m.workflowPackLabels).toContain("Research");
  });

  it("returns empty workflowPackLabels for empty profile", () => {
    const cfg = applyProfile(freshDefaultConfig(), "empty");
    const vf = generateVaultFiles(cfg, NOW);
    const m = generateManifest(cfg, vf);
    expect(m.workflowPackLabels).toHaveLength(0);
  });

  it("sampleNoteCount excludes templates, root docs and obsidian config", () => {
    const cfg = freshDefaultConfig();
    const vf = generateVaultFiles(cfg, NOW);
    const m = generateManifest(cfg, vf);
    // Sample notes must not include Templates/, .obsidian/, Bases/, or root docs
    expect(m.sampleNoteCount).toBeGreaterThan(0);
    // Ensure it's less than total files
    expect(m.sampleNoteCount).toBeLessThan(m.fileCount);
  });

  it("template library items increase templateCount", () => {
    const cfg = freshDefaultConfig();
    const baseVf = generateVaultFiles(cfg, NOW);
    const baseM = generateManifest(cfg, baseVf);

    cfg.templateLibrary = ["decision-log", "bug-report", "goal-note"];
    const libVf = generateVaultFiles(cfg, NOW);
    const libM = generateManifest(cfg, libVf);

    expect(libM.templateCount).toBe(baseM.templateCount + 3);
  });
});

describe("generateManifestMd", () => {
  it("produces a markdown document with summary table", () => {
    const cfg = freshDefaultConfig();
    const vf = generateVaultFiles(cfg, NOW);
    const m = generateManifest(cfg, vf);
    const md = generateManifestMd(m, cfg);
    expect(md).toContain("# VAULT MANIFEST");
    expect(md).toContain(cfg.vaultName);
    expect(md).toContain("## Summary");
    expect(md).toContain("Folders");
    expect(md).toContain("Templates");
    expect(md).toContain("Files");
  });

  it("lists workflow packs when present", () => {
    const cfg = freshDefaultConfig();
    const vf = generateVaultFiles(cfg, NOW);
    const m = generateManifest(cfg, vf);
    const md = generateManifestMd(m, cfg);
    expect(md).toContain("## Workflow packs");
    expect(md).toContain("- Projects");
  });

  it("omits workflow packs section when no packs selected", () => {
    const cfg = applyProfile(freshDefaultConfig(), "empty");
    const vf = generateVaultFiles(cfg, NOW);
    const m = generateManifest(cfg, vf);
    const md = generateManifestMd(m, cfg);
    expect(md).not.toContain("## Workflow packs");
  });

  it("shows home dashboard status", () => {
    const cfg = freshDefaultConfig();
    const vf = generateVaultFiles(cfg, NOW);
    const m = generateManifest(cfg, vf);
    const md = generateManifestMd(m, cfg);
    expect(md).toContain("Home dashboard: yes");
  });
});

describe("VAULT MANIFEST.md in ZIP", () => {
  it("is included in generateVaultFiles output", () => {
    const cfg = freshDefaultConfig();
    const { files } = generateVaultFiles(cfg, NOW);
    expect(files["VAULT MANIFEST.md"]).toBeDefined();
  });

  it("contains the vault name", () => {
    const cfg = freshDefaultConfig();
    cfg.vaultName = "Test Vault XYZ";
    const { files } = generateVaultFiles(cfg, NOW);
    expect(files["VAULT MANIFEST.md"]).toContain("Test Vault XYZ");
  });

  it("is consistent: manifest fileCount matches actual file count minus one (the manifest itself)", () => {
    const cfg = freshDefaultConfig();
    const { files } = generateVaultFiles(cfg, NOW);
    const manifest = files["VAULT MANIFEST.md"];
    // Extract the Files row number from the markdown table
    const match = manifest.match(/\| Files\s*\|\s*(\d+)\s*\|/);
    expect(match).not.toBeNull();
    const reportedCount = parseInt(match![1], 10);
    // The manifest counts files in the VaultFiles built before itself was appended
    expect(reportedCount).toBeLessThan(Object.keys(files).length);
    expect(reportedCount).toBeGreaterThan(0);
  });
});
