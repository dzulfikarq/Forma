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
const stableId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validAccent(value) {
  if (!nonEmpty(value)) return false;
  const match = value.match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  return Boolean(match && Number(match[1]) <= 360 && Number(match[2]) <= 100 && Number(match[3]) <= 100);
}

function validPng(bytes) {
  if (!Buffer.isBuffer(bytes) || !bytes.subarray(0, pngSignature.length).equals(pngSignature)) return false;
  let offset = pngSignature.length;
  let hasHeader = false;
  let hasImageData = false;
  let hasEnd = false;
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    const end = offset + 12 + length;
    if (end > bytes.length) return false;
    if (type === "IHDR") hasHeader = length === 13 && bytes.readUInt32BE(offset + 8) > 0 && bytes.readUInt32BE(offset + 12) > 0;
    if (type === "IDAT" && length > 0) hasImageData = true;
    if (type === "IEND") {
      hasEnd = length === 0 && end === bytes.length;
      break;
    }
    offset = end;
  }
  return hasHeader && hasImageData && hasEnd;
}

function safeTemplatePath(repositoryRoot, templateId, file) {
  if (!nonEmpty(file) || file.includes("\\") || path.posix.isAbsolute(file)) return null;
  const segments = file.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..") || !file.startsWith(`templates/${templateId}/`)) return null;
  const absolute = path.resolve(repositoryRoot, file);
  const relative = path.relative(repositoryRoot, absolute);
  return relative.startsWith("..") || path.isAbsolute(relative) ? null : absolute;
}

export function validateMetadata(categories, templates) {
  const errors = [];
  if (!Array.isArray(categories)) return ["Categories must be an array"];
  if (!Array.isArray(templates)) return ["Templates must be an array"];
  const categoryMap = new Map();
  for (const category of categories) {
    if (typeof category?.id !== "string" || !stableId.test(category.id) || !nonEmpty(category.name) || !nonEmpty(category.description) || categoryMap.has(category.id)) errors.push(`Invalid or duplicate category: ${category?.id ?? "(missing id)"}`);
    else categoryMap.set(category.id, category);
  }
  const ids = new Set();
  for (const template of templates) {
    if (!template || typeof template !== "object" || Array.isArray(template)) {
      errors.push("Invalid template metadata object");
      continue;
    }
    if (typeof template.id !== "string" || !stableId.test(template.id)) errors.push(`Invalid template id: ${template.id ?? "(missing id)"}`);
    if (ids.has(template.id)) errors.push(`Duplicate template id: ${template.id}`);
    ids.add(template.id);
    if (!nonEmpty(template.name) || !nonEmpty(template.description) || !semver.test(template.version ?? "") || !nonEmpty(template.entry) || !nonEmpty(template.preview) || !nonEmpty(template.previewMobile) || !nonEmpty(template.design)) errors.push(`${template.id}: missing required metadata or invalid semver version`);
    if (typeof template.preview !== "string" || !template.preview.endsWith(".png") || typeof template.previewMobile !== "string" || !template.previewMobile.endsWith(".png")) errors.push(`${template.id}: desktop and mobile previews must use PNG files`);
    if (!Array.isArray(template.tags) || !template.tags.length || template.tags.some((tag) => !nonEmpty(tag)) || new Set(template.tags).size !== template.tags.length) errors.push(`${template.id}: tags must be non-empty unique strings`);
    if (!Array.isArray(template.variants) || !template.variants.length || !Array.isArray(template.compatibility) || !template.compatibility.length || !Array.isArray(template.dependencies) || !template.dependencies.length || !Array.isArray(template.tests) || !template.tests.length) errors.push(`${template.id}: variants, compatibility, dependencies, and tests are required arrays`);
    if (template.previewGeneration !== "playwright") errors.push(`${template.id}: preview must be generated from the running implementation with Playwright`);
    const categoryId = typeof template.category === "string" ? template.category : template.category?.id;
    if (template.category && typeof template.category === "object" && (typeof template.category.id !== "string" || !stableId.test(template.category.id) || !nonEmpty(template.category.name) || !nonEmpty(template.category.description))) errors.push(`${template.id}: inline category requires a stable id, name, and description`);
    if (!categoryMap.has(categoryId)) errors.push(`${template.id}: unknown category ${categoryId ?? "(missing)"}`);
    if (!nonEmpty(template.license?.type) || !nonEmpty(template.license?.attribution)) errors.push(`${template.id}: license and attribution required`);
    const variantIds = new Set();
    const variants = Array.isArray(template.variants) ? template.variants : [];
    for (const variant of variants) {
      if (!variant || typeof variant !== "object" || typeof variant.id !== "string" || !stableId.test(variant.id) || !nonEmpty(variant.name) || !validAccent(variant.accent) || variantIds.has(variant.id) || typeof variant.default !== "boolean") errors.push(`${template.id}: invalid or duplicate variant ${variant?.id ?? "(missing id)"}`);
      if (variant && typeof variant === "object") variantIds.add(variant.id);
    }
    if (variants.filter((variant) => variant?.default === true).length !== 1) errors.push(`${template.id}: exactly one default theme variant required`);
    for (const dependency of Array.isArray(template.dependencies) ? template.dependencies : []) if (!nonEmpty(dependency)) errors.push(`${template.id}: dependencies must be non-empty package names`);
    for (const item of Array.isArray(template.compatibility) ? template.compatibility : []) if (!nonEmpty(item?.framework) || !["tested", "untested"].includes(item?.status)) errors.push(`${template.id}: compatibility entries need framework and tested/untested status`);
  }
  return errors;
}

export function validatePackageDependencies(template, manifest) {
  const errors = [];
  if (manifest.name !== `@design-templates/${template.id}` || manifest.version !== template.version) errors.push(`${template.id}: package name/version must match template metadata`);
  if (!nonEmpty(manifest.scripts?.typecheck) || !nonEmpty(manifest.scripts?.test)) errors.push(`${template.id}: package must provide typecheck and test scripts`);
  const runtimeDependencies = new Set([...Object.keys(manifest.dependencies ?? {}), ...Object.keys(manifest.peerDependencies ?? {})]);
  for (const dependency of template.dependencies ?? []) if (!runtimeDependencies.has(dependency)) errors.push(`${template.id}: metadata dependency missing from package.json: ${dependency}`);
  for (const dependency of runtimeDependencies) if (!(template.dependencies ?? []).includes(dependency)) errors.push(`${template.id}: undeclared package dependency: ${dependency}`);
  return errors;
}

export async function buildRegistry(repositoryRoot = root, ref = null) {
  const categoriesSource = JSON.parse(await readFile(path.join(repositoryRoot, "registry/categories.json"), "utf8"));
  const categories = Array.isArray(categoriesSource) ? categoriesSource : [];
  const templateDir = path.join(repositoryRoot, "templates");
  const dirs = (await readdir(templateDir, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  const records = await Promise.all(dirs.map(async (directory) => ({ directory, metadata: JSON.parse(await readFile(path.join(templateDir, directory, "template.json"), "utf8")) })));
  const templates = records.map((record) => record.metadata);
  const errors = Array.isArray(categoriesSource) ? [] : ["Categories must be an array"];
  for (const template of templates) {
    if (template && typeof template === "object" && template.category && typeof template.category === "object" && typeof template.category.id === "string" && stableId.test(template.category.id) && nonEmpty(template.category.name) && nonEmpty(template.category.description)) {
      const existing = categories.find((item) => item?.id === template.category.id);
      if (existing && (existing.name !== template.category.name || existing.description !== template.category.description)) errors.push(`${template.id}: inline category conflicts with registry category ${template.category.id}`);
      else if (!existing) categories.push(template.category);
    }
  }
  errors.push(...validateMetadata(categories, templates));
  for (const { directory, metadata: template } of records) {
    if (!template || typeof template !== "object" || Array.isArray(template)) continue;
    if (template.id !== directory) errors.push(`${directory}: metadata id must match directory name`);
    const files = [template.entry, template.preview, template.previewMobile, template.design, ...(Array.isArray(template.tests) ? template.tests : [])];
    for (const file of files) {
      const absolute = safeTemplatePath(repositoryRoot, template.id, file);
      if (!absolute) errors.push(`${template.id}: unsafe or out-of-template path ${file}`);
      else try { await readFile(absolute); } catch { errors.push(`${template.id}: missing file ${file}`); }
    }
    if (template.previewGeneration === "playwright") {
      for (const preview of [template.preview, template.previewMobile]) {
        const absolute = safeTemplatePath(repositoryRoot, template.id, preview);
        if (!absolute) continue;
        const bytes = await readFile(absolute).catch(() => null);
        if (!validPng(bytes)) errors.push(`${template.id}: Playwright preview must be a valid PNG image (${preview})`);
      }
    }
    const packageFile = safeTemplatePath(repositoryRoot, template.id, `templates/${template.id}/package.json`);
    if (packageFile) {
      let manifest;
      try { manifest = JSON.parse(await readFile(packageFile, "utf8")); } catch { manifest = null; }
      if (!manifest) errors.push(`${template.id}: missing or invalid package.json`);
      else errors.push(...validatePackageDependencies(template, manifest));
    }
    const entryFile = safeTemplatePath(repositoryRoot, template.id, template.entry);
    if (entryFile) {
      const entry = await readFile(entryFile, "utf8").catch(() => "");
      if (!/export\s+default\b|export\s*\{[^}]*\bdefault\b[^}]*\}/s.test(entry)) errors.push(`${template.id}: source entry must default-export its component`);
    }
  }
  if (errors.length) throw new Error(`Registry validation failed:\n- ${errors.join("\n- ")}`);
  if (ref && !(releaseRef.test(ref) || fullCommitSha.test(ref))) throw new Error("Release ref must be a semver tag or full Git commit SHA.");
  return {
    schemaVersion: 1,
    generatedFrom: "templates/*/template.json",
    distribution: { repository: "https://github.com/dzulfikarq/design-templates", ref, immutable: Boolean(ref) },
    categories: categories.sort((a, b) => a.name.localeCompare(b.name)),
    templates: templates.map(({ category, preview, previewMobile, ...template }) => ({
      ...template,
      category: typeof category === "string" ? category : category.id,
      preview: `/previews/${template.id}.png`,
      previewSource: preview,
      previewMobile: `/previews/${template.id}-mobile.png`,
      previewMobileSource: previewMobile,
      source: `templates/${template.id}`
    })).sort((a, b) => a.name.localeCompare(b.name))
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const registry = await buildRegistry(root, refArg);
  const serialized = `${JSON.stringify(registry, null, 2)}\n`;
  const previewDir = path.join(root, "apps/showcase/public/previews");
  const outputs = [[registryFile, serialized]];
  for (const template of registry.templates) {
    outputs.push([path.join(root, "apps/showcase/public", template.preview.slice(1)), path.join(root, template.previewSource)]);
    outputs.push([path.join(root, "apps/showcase/public", template.previewMobile.slice(1)), path.join(root, template.previewMobileSource)]);
  }

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
