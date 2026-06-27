import { describe, it, expect } from "vitest";
import { parseConfigJson, serializeConfig } from "./io";
import { freshDefaultConfig } from "./defaults";

/** A config shaped like an export from BEFORE the P0 fields existed. */
function legacyConfig() {
  const cfg = freshDefaultConfig() as Record<string, unknown>;
  delete cfg.workflowPacks;
  delete cfg.properties;
  delete cfg.bases;
  delete cfg.dashboard;
  delete cfg.experienceLevel;
  delete cfg.devices;
  delete cfg.syncStrategy;
  return cfg;
}

describe("backwards-compatible import", () => {
  it("fills missing P0 fields with defaults instead of crashing", () => {
    const result = parseConfigJson(JSON.stringify(legacyConfig()));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.config.workflowPacks).toEqual([]);
    expect(result.config.properties.useFrontmatter).toBe(true);
    expect(result.config.dashboard.enabled).toBe(true);
    expect(result.config.experienceLevel).toBe("balanced");
  });

  it("maps a legacy git sync flag onto syncStrategy", () => {
    const cfg = legacyConfig();
    (cfg.sync as { git: boolean; icloud: boolean }).git = true;
    const result = parseConfigJson(JSON.stringify(cfg));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.config.syncStrategy).toBe("git");
  });

  it("round-trips a current config", () => {
    const cfg = freshDefaultConfig();
    const result = parseConfigJson(serializeConfig(cfg));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.config.workflowPacks).toEqual(cfg.workflowPacks);
  });
});
