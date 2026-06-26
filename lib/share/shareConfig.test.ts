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
});
