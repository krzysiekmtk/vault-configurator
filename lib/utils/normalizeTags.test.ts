import { describe, it, expect } from "vitest";
import { normalizeTags, formatTag } from "./normalizeTags";

describe("normalizeTags", () => {
  it("splits on commas and newlines", () => {
    expect(normalizeTags("writing, ideas\nhealth")).toEqual(["writing", "ideas", "health"]);
  });

  it("strips leading # without duplicating", () => {
    expect(normalizeTags("#tag")).toEqual(["tag"]);
    expect(normalizeTags("##tag")).toEqual(["tag"]);
  });

  it("slugifies spaces and removes invalid chars", () => {
    expect(normalizeTags("My Cool Tag!")).toEqual(["my-cool-tag"]);
  });

  it("keeps nested slashes", () => {
    expect(normalizeTags("work/clientA")).toEqual(["work/clienta"]);
  });

  it("de-duplicates and drops empties", () => {
    expect(normalizeTags("a, a, , b")).toEqual(["a", "b"]);
  });

  it("formatTag adds a single #", () => {
    expect(formatTag("ideas")).toBe("#ideas");
  });
});
