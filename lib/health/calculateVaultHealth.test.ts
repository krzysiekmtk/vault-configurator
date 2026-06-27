import { describe, it, expect } from "vitest";
import { calculateVaultHealth } from "./calculateVaultHealth";
import { freshDefaultConfig } from "../config/defaults";
import { applyProfile } from "../config/presets";

describe("calculateVaultHealth", () => {
  it("rates the empty profile as low complexity and beginner friendly", () => {
    const cfg = applyProfile(freshDefaultConfig(), "empty");
    const h = calculateVaultHealth(cfg);
    expect(h.complexity).toBe("Low");
    expect(h.beginnerFriendliness).toBe("High");
  });

  it("rates a fully loaded dev power-user setup as more complex", () => {
    const cfg = freshDefaultConfig(); // dev: many packs + plugins + bases
    const h = calculateVaultHealth(cfg);
    expect(["Medium", "High"]).toContain(h.complexity);
    expect(h.recommendations.length).toBeGreaterThan(0);
  });

  it("raises mobile risk for heavy plugins on a phone", () => {
    const cfg = freshDefaultConfig();
    cfg.devices = ["iphone"];
    cfg.communityPlugins.excalidraw = true;
    cfg.communityPlugins.dataview = true;
    cfg.communityPlugins.templater = true;
    const h = calculateVaultHealth(cfg);
    expect(h.mobileRisk).toBe("High");
    expect(h.recommendations.some((r) => r.toLowerCase().includes("excalidraw"))).toBe(true);
  });

  it("experience level only changes recommendations, not config", () => {
    const beginner = { ...freshDefaultConfig(), experienceLevel: "beginner" as const };
    const power = { ...freshDefaultConfig(), experienceLevel: "power" as const };
    const hb = calculateVaultHealth(beginner);
    const hp = calculateVaultHealth(power);
    expect(hb.complexity).toBe(hp.complexity); // scoring unaffected
    expect(hb.recommendations).not.toEqual(hp.recommendations);
  });
});
