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

describe("calculateVaultHealth — P1 scenarios", () => {
  it("many library templates push complexity up", () => {
    const base = freshDefaultConfig();
    base.workflowPacks = [];
    base.templateLibrary = [];
    const baseH = calculateVaultHealth(base);

    const heavy = freshDefaultConfig();
    heavy.workflowPacks = [];
    heavy.templateLibrary = [
      "decision-log", "bug-report", "sprint-note", "goal-note",
      "web-clip", "youtube-note", "pdf-note", "code-snippet", "quote",
    ];
    const heavyH = calculateVaultHealth(heavy);

    const complexityOrder = ["Low", "Medium", "High"];
    expect(complexityOrder.indexOf(heavyH.complexity)).toBeGreaterThanOrEqual(
      complexityOrder.indexOf(baseH.complexity),
    );
  });

  it("mobile-safe pack scenario: no heavy plugins on iphone = lower mobileRisk than excalidraw+dataview", () => {
    const risky = freshDefaultConfig();
    risky.devices = ["iphone"];
    risky.communityPlugins.excalidraw = true;
    risky.communityPlugins.dataview = true;
    risky.communityPlugins.templater = true;
    const riskyH = calculateVaultHealth(risky);

    const safe = freshDefaultConfig();
    safe.devices = ["iphone"];
    safe.communityPlugins.excalidraw = false;
    safe.communityPlugins.dataview = false;
    safe.communityPlugins.templater = false;
    safe.communityPlugins.kanban = false;
    safe.communityPlugins.tasks = false;
    const safeH = calculateVaultHealth(safe);

    const riskOrder = ["Low", "Medium", "High"];
    expect(riskOrder.indexOf(riskyH.mobileRisk)).toBeGreaterThan(
      riskOrder.indexOf(safeH.mobileRisk),
    );
  });

  it("power-user profile has high plugin dependency signal", () => {
    const cfg = freshDefaultConfig();
    cfg.communityPlugins = {
      tasks: true, kanban: true, dataview: true,
      excalidraw: true, templater: true, calendar: true,
    };
    const h = calculateVaultHealth(cfg);
    // Power user with everything on should not be "Low" complexity
    expect(h.complexity).not.toBe("Low");
  });

  it("review packs alone (no heavy plugins, icloud sync) have lower mobile risk than excalidraw+git", () => {
    const safe = freshDefaultConfig();
    safe.workflowPacks = ["monthly-review", "quarterly-review", "yearly-review"];
    safe.devices = ["desktop"];
    safe.syncStrategy = "icloud";
    safe.communityPlugins = { tasks: false, kanban: false, dataview: false, excalidraw: false, templater: false, calendar: false };
    const safeH = calculateVaultHealth(safe);

    const risky = freshDefaultConfig();
    risky.devices = ["iphone"];
    risky.syncStrategy = "git";
    risky.communityPlugins.excalidraw = true;
    risky.communityPlugins.dataview = true;
    const riskyH = calculateVaultHealth(risky);

    const order = ["Low", "Medium", "High"];
    expect(order.indexOf(safeH.mobileRisk)).toBeLessThan(order.indexOf(riskyH.mobileRisk));
  });
});
