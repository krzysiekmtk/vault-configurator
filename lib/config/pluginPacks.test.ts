import { describe, it, expect } from "vitest";
import { PLUGIN_PACKS } from "./pluginPacks";
import { freshDefaultConfig } from "./defaults";

function applyPack(key: string) {
  const cfg = freshDefaultConfig();
  const pack = PLUGIN_PACKS.find((p) => p.key === key);
  if (!pack) throw new Error(`Unknown pack: ${key}`);
  pack.apply(cfg);
  return cfg;
}

describe("pluginPacks", () => {
  it("exports 8 packs", () => {
    expect(PLUGIN_PACKS).toHaveLength(8);
  });

  it("every pack has key, label, description and apply", () => {
    for (const pack of PLUGIN_PACKS) {
      expect(typeof pack.key).toBe("string");
      expect(typeof pack.label).toBe("string");
      expect(typeof pack.description).toBe("string");
      expect(typeof pack.apply).toBe("function");
    }
  });

  describe("minimal-core", () => {
    it("enables only dailyNotes and templates, all community off", () => {
      const cfg = applyPack("minimal-core");
      expect(cfg.corePlugins.dailyNotes).toBe(true);
      expect(cfg.corePlugins.templates).toBe(true);
      expect(cfg.corePlugins.graphView).toBe(false);
      expect(cfg.communityPlugins.tasks).toBe(false);
      expect(cfg.communityPlugins.dataview).toBe(false);
      expect(cfg.communityPlugins.excalidraw).toBe(false);
      expect(cfg.communityPlugins.kanban).toBe(false);
    });
  });

  describe("task-management", () => {
    it("enables tasks, kanban and calendar", () => {
      const cfg = applyPack("task-management");
      expect(cfg.communityPlugins.tasks).toBe(true);
      expect(cfg.communityPlugins.kanban).toBe(true);
      expect(cfg.communityPlugins.calendar).toBe(true);
      expect(cfg.communityPlugins.excalidraw).toBe(false);
      expect(cfg.communityPlugins.dataview).toBe(false);
    });
  });

  describe("research", () => {
    it("enables dataview and templater, graphView and backlinks", () => {
      const cfg = applyPack("research");
      expect(cfg.communityPlugins.dataview).toBe(true);
      expect(cfg.communityPlugins.templater).toBe(true);
      expect(cfg.corePlugins.graphView).toBe(true);
      expect(cfg.corePlugins.backlinks).toBe(true);
    });
  });

  describe("visual-thinking", () => {
    it("enables excalidraw and kanban", () => {
      const cfg = applyPack("visual-thinking");
      expect(cfg.communityPlugins.excalidraw).toBe(true);
      expect(cfg.communityPlugins.kanban).toBe(true);
      expect(cfg.corePlugins.graphView).toBe(true);
    });
  });

  describe("mobile-safe", () => {
    it("turns off all heavy community plugins", () => {
      const cfg = applyPack("mobile-safe");
      expect(cfg.communityPlugins.excalidraw).toBe(false);
      expect(cfg.communityPlugins.dataview).toBe(false);
      expect(cfg.communityPlugins.kanban).toBe(false);
      expect(cfg.communityPlugins.templater).toBe(false);
      expect(cfg.communityPlugins.tasks).toBe(false);
    });

    it("keeps dailyNotes and bookmarks on for basic use", () => {
      const cfg = applyPack("mobile-safe");
      expect(cfg.corePlugins.dailyNotes).toBe(true);
      expect(cfg.corePlugins.bookmarks).toBe(true);
    });
  });

  describe("developer", () => {
    it("enables dataview, templater, tasks and kanban", () => {
      const cfg = applyPack("developer");
      expect(cfg.communityPlugins.dataview).toBe(true);
      expect(cfg.communityPlugins.templater).toBe(true);
      expect(cfg.communityPlugins.tasks).toBe(true);
      expect(cfg.communityPlugins.kanban).toBe(true);
    });
  });

  describe("power-user", () => {
    it("enables all core and community plugins", () => {
      const cfg = applyPack("power-user");
      expect(cfg.corePlugins.dailyNotes).toBe(true);
      expect(cfg.corePlugins.templates).toBe(true);
      expect(cfg.corePlugins.graphView).toBe(true);
      expect(cfg.corePlugins.backlinks).toBe(true);
      expect(cfg.corePlugins.bookmarks).toBe(true);
      expect(cfg.corePlugins.audioRecorder).toBe(true);
      expect(cfg.communityPlugins.tasks).toBe(true);
      expect(cfg.communityPlugins.kanban).toBe(true);
      expect(cfg.communityPlugins.dataview).toBe(true);
      expect(cfg.communityPlugins.excalidraw).toBe(true);
      expect(cfg.communityPlugins.templater).toBe(true);
      expect(cfg.communityPlugins.calendar).toBe(true);
    });
  });

  describe("writing", () => {
    it("enables templater and audioRecorder, no heavy query plugins", () => {
      const cfg = applyPack("writing");
      expect(cfg.communityPlugins.templater).toBe(true);
      expect(cfg.corePlugins.audioRecorder).toBe(true);
      expect(cfg.communityPlugins.dataview).toBe(false);
      expect(cfg.communityPlugins.excalidraw).toBe(false);
    });
  });

  it("apply() does not throw on any valid config", () => {
    const cfg = freshDefaultConfig();
    for (const pack of PLUGIN_PACKS) {
      expect(() => pack.apply(cfg)).not.toThrow();
    }
  });
});
