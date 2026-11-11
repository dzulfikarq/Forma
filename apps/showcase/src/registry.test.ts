import { describe, expect, it } from "vitest";
import { buildRegistry, validateMetadata } from "../../../scripts/build-registry.mjs";
import { registry } from "./registry";

const validTemplate = {
  id: "new-template", name: "New Template", description: "A template.", category: "new-category", version: "1.0.0",
  entry: "entry.tsx", preview: "preview.svg", design: "design.md", tags: [],
  compatibility: [{ framework: "React + Vite", status: "tested" }], variants: [{ id: "base", name: "Base", accent: "20 90% 50%", default: true }],
  dependencies: [], license: { type: "MIT", attribution: "Original" }, tests: ["test.tsx"]
};

describe("registry metadata", () => {
  it("builds unique category and template records from metadata", () => {
    expect(registry.templates.map((template) => template.id)).toEqual(["modern-admin"]);
    expect(registry.categories.map((category) => category.id)).toContain("admin-cms");
    expect(registry.distribution.immutable).toBe(false);
  });

  it("accepts metadata-defined new categories without app changes", () => {
    expect(validateMetadata([{ id: "new-category", name: "New Category", description: "Category for new templates." }], [validTemplate])).toEqual([]);
  });

  it("rejects missing category and duplicate theme variants", () => {
    const invalid = { ...validTemplate, variants: [{ id: "same", name: "A", accent: "20 90% 50%", default: true }, { id: "same", name: "B", accent: "20 90% 50%", default: false }] };
    expect(validateMetadata([], [invalid]).join("\n")).toMatch(/unknown category/);
    expect(validateMetadata([{ id: "new-category", name: "New Category", description: "Category for new templates." }], [invalid]).join("\n")).toMatch(/duplicate variant/);
  });

  it("pins only semver tags or full commit SHAs", async () => {
    await expect(buildRegistry(undefined, "v1.2.3+build.7")).resolves.toMatchObject({ distribution: { ref: "v1.2.3+build.7", immutable: true } });
    await expect(buildRegistry(undefined, "a".repeat(40))).resolves.toMatchObject({ distribution: { ref: "a".repeat(40), immutable: true } });
    await expect(buildRegistry(undefined, "main")).rejects.toThrow(/semver tag or full Git commit SHA/);
    await expect(buildRegistry(undefined, "a".repeat(41))).rejects.toThrow(/semver tag or full Git commit SHA/);
    await expect(buildRegistry(undefined, "v1.2.3-01")).rejects.toThrow(/semver tag or full Git commit SHA/);
  });
});
