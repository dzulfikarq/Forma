import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryFile = path.join(root, "registry/registry.json");
const refArg = process.argv.find((arg) => arg.startsWith("--ref="))?.slice(6) ?? process.env.TEMPLATE_RELEASE_REF ?? null;
const check = process.argv.includes("--check");
const semverCore = "(?:0|[1-9]\\d*)";
const semverIdentifier = "(?:0|[1-9]\\d*|\\d*[A-Za-z-][0-9A-Za-z-]*)";
const semver = new RegExp(`^${semverCore}\\.${semverCore}\\.${semverCore}(?:-${semverIdentifier}(?:\\.${semverIdentifier})*)?(?:\\+[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?$`);
const releaseRef = new RegExp(`^v?${semver.source.slice(1, -1)}$`);
const fullCommitSha = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i;

export function validateMetadata(categories, templates) {
  const errors = [];
  const categoryMap = new Map();
  for (const category of categories) {
    if (!category?.id || !category?.name || !category?.description || categoryMap.has(category.id)) errors.push(`Invalid or duplicate category: ${category?.id ?? "(missing id)"}`);
    else categoryMap.set(category.id, category);
  }
  const ids = new Set();
  for (const template of templates) {
    if (!template?.id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(template.id)) errors.push(`Invalid template id: ${template?.id ?? "(missing id)"}`);
    if (ids.has(template.id)) errors.push(`Duplicate template id: ${template.id}`);
    ids.add(template.id);
    if (!template.name || !template.description || !semver.test(template.version ?? "") || !template.entry || !template.preview || !template.design) errors.push(`${template.id}: missing required metadata or invalid semver version`);
    if (!Array.isArray(template.tags) || !Array.isArray(template.variants) || !template.variants.length || !Array.isArray(template.compatibility) || !Array.isArray(template.dependencies) || !Array.isArray(template.tests)) errors.push(`${template.id}: tags, variants, compatibility, dependencies, and tests must be arrays`);
    if (!Array.isArray(template.tests) || !template.tests.length) errors.push(`${template.id}: at least one template test required`);
    const categoryId = typeof template.category === "string" ? template.category : template.category?.id;
    if (!categoryMap.has(categoryId)) errors.push(`${template.id}: unknown category ${categoryId ?? "(missing)"}`);
    if (!template.license?.type || !template.license?.attribution) errors.push(`${template.id}: license and attribution required`);
    const variantIds = new Set();
    for (const variant of template.variants ?? []) {
      if (!variant.id || !variant.name || !variant.accent || variantIds.has(variant.id)) errors.push(`${template.id}: invalid or duplicate variant ${variant.id ?? "(missing id)"}`);
      variantIds.add(variant.id);
    }
    if ((template.variants ?? []).filter((variant) => variant.default).length !== 1) errors.push(`${template.id}: exactly one default theme variant required`);
  }
  return errors;
}

export async function buildRegistry(repositoryRoot = root, ref = null) {
  const categories = JSON.parse(await readFile(path.join(repositoryRoot, "registry/categories.json"), "utf8"));
  const templateDir = path.join(repositoryRoot, "templates");
  const dirs = (await readdir(templateDir, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  const records = await Promise.all(dirs.map(async (directory) => ({ directory, metadata: JSON.parse(await readFile(path.join(templateDir, directory, "template.json"), "utf8")) })));
  const templates = records.map((record) => record.metadata);
  for (const template of templates) {
    if (typeof template.category === "object" && template.category?.id && template.category?.name && !categories.some((item) => item.id === template.category.id)) categories.push(template.category);
  }
  const errors = validateMetadata(categories, templates);
  for (const { directory, metadata: template } of records) {
    if (template.id !== directory) errors.push(`${directory}: metadata id must match directory name`);
    for (const file of [template.entry, template.preview, template.design, ...(template.tests ?? [])]) {
      const absolute = path.resolve(repositoryRoot, file);
      if (!absolute.startsWith(`${repositoryRoot}${path.sep}`)) errors.push(`${template.id}: unsafe path ${file}`);
      else try { await readFile(absolute); } catch { errors.push(`${template.id}: missing file ${file}`); }
    }
    if ((template.compatibility ?? []).some((item) => !["tested", "untested"].includes(item.status) || !item.framework)) errors.push(`${template.id}: compatibility entries need framework and tested/untested status`);
  }
  if (errors.length) throw new Error(`Registry validation failed:\n- ${errors.join("\n- ")}`);
  if (ref && !(releaseRef.test(ref) || fullCommitSha.test(ref))) throw new Error("Release ref must be a semver tag or full Git commit SHA.");
  return {
    schemaVersion: 1,
    generatedFrom: "templates/*/template.json",
    distribution: { repository: "https://github.com/dzulfikarq/design-templates", ref, immutable: Boolean(ref) },
    categories: categories.sort((a, b) => a.name.localeCompare(b.name)),
    templates: templates.map(({ category, preview, ...template }) => ({ ...template, category: typeof category === "string" ? category : category.id, preview: `/previews/${template.id}${path.extname(preview)}`, previewSource: preview, source: `templates/${template.id}` })).sort((a, b) => a.name.localeCompare(b.name))
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const registry = await buildRegistry(root, refArg);
  const serialized = `${JSON.stringify(registry, null, 2)}\n`;
  const previewDir = path.join(root, "apps/showcase/public/previews");
  const outputs = [[registryFile, serialized]];
  for (const template of registry.templates) outputs.push([path.join(previewDir, path.basename(template.preview)), path.join(root, template.previewSource)]);

  if (check) {
    const current = await readFile(registryFile, "utf8").catch(() => "");
    if (current !== serialized) throw new Error("registry/registry.json is stale. Run pnpm registry:build.");
    for (const [destination, source] of outputs.slice(1)) {
      const existing = await readFile(destination, "utf8").catch(() => "");
      const expected = await readFile(source, "utf8");
      if (existing !== expected) throw new Error(`${path.relative(root, destination)} is stale. Run pnpm registry:build.`);
    }
  } else {
    await mkdir(path.dirname(registryFile), { recursive: true });
    await writeFile(registryFile, serialized);
    await mkdir(previewDir, { recursive: true });
    for (const [destination, source] of outputs.slice(1)) await copyFile(source, destination);
  }
  console.log(`Registry ${check ? "valid" : "built"}: ${registry.templates.length} template(s), ${registry.categories.length} categories.`);
}
