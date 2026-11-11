import rawRegistry from "../../../registry/registry.json";

export type TemplateVariant = { id: string; name: string; accent: string; default: boolean };
export type Template = {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  version: string;
  entry: string;
  preview: string;
  previewSource: string;
  design: string;
  compatibility: Array<{ framework: string; status: "tested" | "untested" }>;
  variants: TemplateVariant[];
  dependencies: string[];
  license: { type: string; attribution: string };
  tests: string[];
  source: string;
};
export type Category = { id: string; name: string; description: string };
export type Registry = { schemaVersion: number; generatedFrom: string; distribution: { repository: string; ref: string | null; immutable: boolean }; categories: Category[]; templates: Template[] };
export const registry = rawRegistry as Registry;

export function getCategoryName(id: string, categories: Category[]) {
  return categories.find((category) => category.id === id)?.name ?? id;
}
