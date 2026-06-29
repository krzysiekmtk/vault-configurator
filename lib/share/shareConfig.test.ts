import { describe, it, expect } from "vitest";
import { freshDefaultConfig } from "../config/defaults";
import { applyProfile } from "../config/presets";
import { encodeConfigToHash, decodeConfigFromHash } from "./shareConfig";

describe("shareConfig", () => {
  it("round-trips a config through the hash", () => {
    const cfg = applyProfile(freshDefaultConfig(), "journal");
    cfg.vaultName = "Journal 2026";
    const hash = encodeConfigToHash(cfg);
    const decoded = decodeConfigFromHash("#" + hash);
    expect(decoded).toEqual(cfg);
  });

  it("returns null for a malformed hash", () => {
    expect(decodeConfigFromHash("#cfg=not-valid-base64!!")).toBeNull();
  });

  it("returns null when the prefix is missing", () => {
    expect(decodeConfigFromHash("#something-else")).toBeNull();
  });

  it("preserves P1 fields through hash round-trip", () => {
    const cfg = freshDefaultConfig();
    cfg.templateLibrary = ["decision-log", "bug-report", "goal-note"];
    cfg.promptMode = "implementation-plan";
    const hash = encodeConfigToHash(cfg);
    const decoded = decodeConfigFromHash("#" + hash);
    expect(decoded?.templateLibrary).toEqual(["decision-log", "bug-report", "goal-note"]);
    expect(decoded?.promptMode).toBe("implementation-plan");
  });

  it("P1 fields default when absent from older hash", () => {
    // A config without P1 fields (simulates old share URL)
    const cfg = freshDefaultConfig() as Record<string, unknown>;
    delete cfg.templateLibrary;
    delete cfg.promptMode;
    const hash = encodeConfigToHash(cfg as Parameters<typeof encodeConfigToHash>[0]);
    const decoded = decodeConfigFromHash("#" + hash);
    expect(decoded?.templateLibrary).toEqual([]);
    expect(decoded?.promptMode).toBe("new-vault");
  });

  it("preserves all P0 fields through hash round-trip", () => {
    const cfg = freshDefaultConfig();
    cfg.workflowPacks = ["projects", "tasks", "meetings"];
    cfg.properties = { useFrontmatter: true, enabled: ["type", "status", "due"] };
    cfg.bases = { enabled: true, views: ["projects", "tasks"] };
    cfg.dashboard = { enabled: true, sections: ["activeProjects", "openTasks"] };
    cfg.experienceLevel = "power";
    cfg.devices = ["desktop", "iphone"];
    cfg.syncStrategy = "icloud";
    const hash = encodeConfigToHash(cfg);
    const decoded = decodeConfigFromHash("#" + hash);
    expect(decoded?.workflowPacks).toEqual(cfg.workflowPacks);
    expect(decoded?.properties).toEqual(cfg.properties);
    expect(decoded?.bases).toEqual(cfg.bases);
    expect(decoded?.dashboard).toEqual(cfg.dashboard);
    expect(decoded?.experienceLevel).toBe(cfg.experienceLevel);
    expect(decoded?.devices).toEqual(cfg.devices);
    expect(decoded?.syncStrategy).toBe(cfg.syncStrategy);
  });
});
