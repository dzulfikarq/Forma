import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { access, lstat, mkdir, mkdtemp, readFile, readdir, realpath, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const FORMAT = "forma-portable-template";
export const FORMAT_VERSION = 1;
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const stableId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const internalPackages = new Set(["@design-templates/ui", "@design-templates/utilities", "@design-templates/tokens"]);
const nonRegistryDependency = /^(?:workspace:|file:|link:|portal:|git(?:\+|:)|github:|https?:|npm:|catalog:)/i;

const sharedBuildDependencies = {
  autoprefixer: "^10.4.21",
  postcss: "^8.5.6",
  tailwindcss: "^3.4.18",
  typescript: "^5.9.3",
  "@types/react": "^19.1.16",
  "@types/react-dom": "^19.1.9"
};

export const adapterDependencies = {
  "react-vite": {
    framework: "React + Vite",
    dependencies: { react: "^19.0.0", "react-dom": "^19.0.0" },
    devDependencies: { "@vitejs/plugin-react": "^5.0.4", vite: "^7.3.8" }
  },
  "next-app-router": {
    framework: "Next.js App Router",
    dependencies: { next: "^16.4.6", react: "^19.0.0", "react-dom": "^19.0.0" },
    devDependencies: { "@types/node": "^22.15.30" }
  }
};

function digest(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function portablePath(value) {
  if (typeof value !== "string" || !value || value.includes("\\") || value.includes("\0") || path.posix.isAbsolute(value)) return false;
  return value.split("/").every((part) => part && part !== "." && part !== "..");
}

function pathInside(base, relative) {
  if (!portablePath(relative)) throw new Error(`Unsafe package path: ${relative}`);
  const absolute = path.resolve(base, ...relative.split("/"));
  const escaped = path.relative(base, absolute);
  if (escaped.startsWith("..") || path.isAbsolute(escaped)) throw new Error(`Package path escapes root: ${relative}`);
  return absolute;
}

async function walk(directory, prefix = "") {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = path.join(directory, entry.name);
    const stat = await lstat(absolute);
    if (stat.isSymbolicLink()) throw new Error(`Template source contains symlink: ${relative}`);
    if (stat.isDirectory()) result.push(...await walk(absolute, relative));
    else if (stat.isFile()) result.push({ absolute, relative });
    else throw new Error(`Unsupported template source entry: ${relative}`);
  }
  return result;
}

function modulePath(fromFile, targetFile) {
  let value = path.posix.relative(path.posix.dirname(fromFile), targetFile);
  if (!value.startsWith(".")) value = `./${value}`;
  return value;
}

function rewriteImports(source, outputPath) {
  source = source.replace(/^\s*import\s+["'][^"']+\.css["'];?\s*$/gm, "");
  source = source.replace(/(["'])(@design-templates\/(?:ui|utilities|tokens))(?:\/styles\.css)?\1/g, (match, quote, name) => {
    if (name === "@design-templates/ui") return `${quote}${modulePath(outputPath, "src/forma/ui")}${quote}`;
    if (name === "@design-templates/utilities") return `${quote}${modulePath(outputPath, "src/forma/utilities")}${quote}`;
    throw new Error(`Template imports unsupported workspace package ${name}; only shared UI, utilities, and token styles can be exported.`);
  });
  if (/@design-templates\//.test(source) || /(?:from\s*["']|import\s*["'])workspace:/.test(source)) {
    throw new Error(`Unresolved workspace import in ${outputPath}.`);
  }
  return source.trimStart();
}

function addDependency(target, name, specifier, origin) {
  if (internalPackages.has(name)) return;
  if (typeof specifier !== "string" || !specifier || nonRegistryDependency.test(specifier)) {
    throw new Error(`${origin} has non-portable dependency ${name}@${specifier}.`);
  }
  if (target[name] && target[name] !== specifier) throw new Error(`Conflicting ranges for ${name}: ${target[name]} and ${specifier}.`);
  target[name] = specifier;
}

async function sourceReference(repositoryRoot, id) {
  const sources = [`templates/${id}`, "packages/ui", "packages/tokens", "packages/utilities", "apps/showcase/tailwind.config.js", "scripts/template-export.mjs", "scripts/template-install.mjs"];
  try {
    execFileSync("git", ["diff", "--quiet", "HEAD", "--", ...sources], { cwd: repositoryRoot, stdio: "ignore" });
    const status = execFileSync("git", ["status", "--porcelain", "--", ...sources], { cwd: repositoryRoot, encoding: "utf8" });
    if (status.trim()) return null;
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: repositoryRoot, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

export async function buildPortablePackage(id, repositoryRoot = root) {
  if (!stableId.test(id)) throw new Error(`Invalid template ID: ${id}`);
  const templateDirectory = path.join(repositoryRoot, "templates", id);
  const metadata = JSON.parse(await readFile(path.join(templateDirectory, "template.json"), "utf8"));
  if (metadata.id !== id || metadata.version === undefined) throw new Error(`Invalid metadata for ${id}.`);
  const templatePackage = JSON.parse(await readFile(path.join(templateDirectory, "package.json"), "utf8"));
  const uiPackage = JSON.parse(await readFile(path.join(repositoryRoot, "packages/ui/package.json"), "utf8"));
  const sourceEntries = await walk(path.join(templateDirectory, "src"));
  const payload = new Map();

  for (const entry of sourceEntries) {
    if (/(?:^|\.)(?:test|spec)\.[cm]?[jt]sx?$/.test(entry.relative)) continue;
    const destination = `src/template/${entry.relative}`;
    const bytes = await readFile(entry.absolute);
    if (/\.[cm]?[jt]sx?$/.test(entry.relative)) payload.set(destination, rewriteImports(bytes.toString("utf8"), destination));
    else payload.set(destination, bytes);
  }

  for (const [source, destination] of [
    ["packages/ui/src/index.tsx", "src/forma/ui.tsx"],
    ["packages/ui/src/theme.tsx", "src/forma/theme.tsx"],
    ["packages/utilities/src/index.ts", "src/forma/utilities.ts"]
  ]) {
    const contents = await readFile(path.join(repositoryRoot, source), "utf8");
    payload.set(destination, rewriteImports(contents, destination));
  }

  const tokenCss = await readFile(path.join(repositoryRoot, "packages/tokens/src/styles.css"), "utf8");
  const uiCss = await readFile(path.join(repositoryRoot, "packages/ui/src/ui.css"), "utf8");
  payload.set("styles/forma.css", `${tokenCss.trimEnd()}\n\n${uiCss.trimStart()}`);

  let tailwindConfig = await readFile(path.join(repositoryRoot, "apps/showcase/tailwind.config.js"), "utf8");
  const workspaceContent = 'content: ["./index.html", "./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}", "../../templates/*/src/**/*.{ts,tsx}"],';
  if (!tailwindConfig.includes(workspaceContent)) throw new Error("Cannot sanitize Tailwind config: expected workspace content globs were not found.");
  tailwindConfig = tailwindConfig.replace(workspaceContent, 'content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx,mdx}"],');
  payload.set("tailwind.config.js", tailwindConfig);
  payload.set("postcss.config.js", "export default { plugins: { tailwindcss: {}, autoprefixer: {} } };\n");
  payload.set("design.md", await readFile(path.join(templateDirectory, "design.md")));
  payload.set("ATTRIBUTIONS.md", Buffer.from("# Attributions\n\nPlus Jakarta Sans is loaded from Google Fonts at runtime. Font is distributed under the SIL Open Font License 1.1; see https://fonts.google.com/specimen/Plus+Jakarta+Sans and https://openfontlicense.org/. A system sans-serif fallback remains configured.\n"));
  payload.set("INSTALL.md", Buffer.from(`# ${metadata.name} · ${metadata.version}\n\nPortable Forma template bundle. Shared UI, semantic tokens, Tailwind configuration, dependencies, and source are included.\n\nInstall into a new target directory with:\n\n    node <forma-repository>/scripts/template-install.mjs --id ${id} --package <this-package> --framework react-vite --target <new-project-dir> --variant ${metadata.variants.find((variant) => variant.default)?.id ?? metadata.variants[0]?.id}\n\nOnly frameworks marked tested in forma.install.json are installable. The installer refuses existing targets; it does not merge or overwrite files.\n`));

  for (const [file, contents] of payload) {
    if (/\.[cm]?[jt]sx?$/.test(file)) {
      const source = contents.toString("utf8");
      if (source.includes("import.meta.glob") || /(?:\.\.\/){2,}(?:packages|templates|apps)\//.test(source)) {
        throw new Error(`Non-portable workspace/Vite reference in ${file}.`);
      }
    }
  }

  const runtimeDependencies = {};
  for (const [name, specifier] of Object.entries({ ...uiPackage.dependencies, ...uiPackage.peerDependencies, ...templatePackage.dependencies, ...templatePackage.peerDependencies })) {
    addDependency(runtimeDependencies, name, specifier, `${id}/package.json`);
  }
  runtimeDependencies.react = "^19.0.0";
  runtimeDependencies["react-dom"] = "^19.0.0";

  const styleFiles = [...payload.keys()].filter((file) => file.startsWith("src/template/") && file.endsWith(".css")).sort();
  const compatibility = Array.isArray(metadata.compatibility) ? metadata.compatibility : [];
  const portableMetadata = {
    id: metadata.id,
    name: metadata.name,
    description: metadata.description,
    category: metadata.category,
    tags: metadata.tags,
    version: metadata.version,
    license: metadata.license,
    variants: metadata.variants,
    compatibility,
    entry: "src/template/entry.tsx",
    design: "design.md",
    dependencies: Object.keys(runtimeDependencies).sort()
  };
  payload.set("template.json", `${JSON.stringify(portableMetadata, null, 2)}\n`);

  const packageManifest = {
    name: `forma-template-${id}`,
    version: metadata.version,
    private: true,
    type: "module",
    dependencies: Object.fromEntries(Object.entries(runtimeDependencies).sort(([a], [b]) => a.localeCompare(b))),
    devDependencies: sharedBuildDependencies
  };
  payload.set("package.json", `${JSON.stringify(packageManifest, null, 2)}\n`);

  const files = [...payload.entries()].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([file, contents]) => ({ path: file, sha256: digest(contents) }));
  const contentHash = digest(files.map(({ path: file, sha256 }) => `${file}\0${sha256}\n`).join(""));
  const manifest = {
    format: FORMAT,
    formatVersion: FORMAT_VERSION,
    template: { id, name: metadata.name, version: metadata.version, category: metadata.category, license: metadata.license, variants: metadata.variants, compatibility, entry: portableMetadata.entry, design: portableMetadata.design },
    source: { repository: "https://github.com/dzulfikarq/design-templates", ref: await sourceReference(repositoryRoot, id) },
    integrity: { algorithm: "sha256", contentHash },
    dependencies: {
      runtime: packageManifest.dependencies,
      sharedBuild: sharedBuildDependencies,
      adapters: adapterDependencies
    },
    styles: { shared: "styles/forma.css", template: styleFiles },
    files
  };
  payload.set("forma.install.json", `${JSON.stringify(manifest, null, 2)}\n`);
  return { id, version: metadata.version, payload, manifest };
}

export async function createPortablePackage({ id, outDir, repositoryRoot = root }) {
  if (!outDir) throw new Error("Output directory is required.");
  const packageData = await buildPortablePackage(id, repositoryRoot);
  const output = path.resolve(repositoryRoot, outDir);
  const parent = path.dirname(output);
  await mkdir(parent, { recursive: true });
  try { await access(output); throw new Error(`Export target already exists: ${output}`); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  const stage = await mkdtemp(path.join(parent, `.${path.basename(output)}.stage-`));
  try {
    for (const [relative, contents] of packageData.payload) {
      const destination = pathInside(stage, relative);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, contents, { flag: "wx" });
    }
    try { await access(output); throw new Error(`Export target appeared during export: ${output}`); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
    await rename(stage, output);
  } catch (error) {
    await rm(stage, { recursive: true, force: true });
    throw error;
  }
  return { output, ...packageData };
}

export async function validatePortablePackage(packageDirectory) {
  const packageRoot = await realpath(path.resolve(packageDirectory));
  const manifest = JSON.parse(await readFile(path.join(packageRoot, "forma.install.json"), "utf8"));
  if (manifest.format !== FORMAT || manifest.formatVersion !== FORMAT_VERSION) throw new Error("Unsupported Forma package format.");
  if (!stableId.test(manifest.template?.id ?? "") || typeof manifest.template.version !== "string") throw new Error("Portable package has invalid template identity.");
  if (!Array.isArray(manifest.files) || !manifest.files.length) throw new Error("Portable package has no file manifest.");
  if (!Array.isArray(manifest.template.variants) || !manifest.template.variants.length || !Array.isArray(manifest.template.compatibility) || !Array.isArray(manifest.styles?.template) || typeof manifest.styles.shared !== "string") {
    throw new Error("Portable package metadata or style manifest is invalid.");
  }
  if (manifest.source?.ref !== null && !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(manifest.source?.ref ?? "")) throw new Error("Portable package source ref must be a full commit SHA or null.");
  const seen = new Set();
  const hashes = [];
  const payload = new Map();
  for (const record of manifest.files) {
    if (!portablePath(record.path) || seen.has(record.path) || !/^[a-f0-9]{64}$/.test(record.sha256 ?? "")) throw new Error(`Invalid or duplicate payload record: ${record.path}`);
    seen.add(record.path);
    const absolute = pathInside(packageRoot, record.path);
    let cursor = packageRoot;
    let stat;
    const segments = record.path.split("/");
    for (const [index, segment] of segments.entries()) {
      cursor = path.join(cursor, segment);
      stat = await lstat(cursor).catch(() => null);
      if (!stat || stat.isSymbolicLink() || (index < segments.length - 1 && !stat.isDirectory())) throw new Error(`Missing or unsafe package file: ${record.path}`);
    }
    if (!stat?.isFile()) throw new Error(`Missing or unsafe package file: ${record.path}`);
    const bytes = await readFile(absolute);
    const actual = digest(bytes);
    if (actual !== record.sha256) throw new Error(`Package integrity mismatch: ${record.path}`);
    payload.set(record.path, bytes);
    hashes.push(`${record.path}\0${actual}\n`);
  }
  if (digest(hashes.sort().join("")) !== manifest.integrity?.contentHash) throw new Error("Portable package content hash mismatch.");
  const required = ["template.json", "design.md", "package.json", "src/template/entry.tsx", "src/forma/ui.tsx", "src/forma/theme.tsx", "src/forma/utilities.ts", manifest.styles?.shared, "tailwind.config.js", "postcss.config.js"];
  for (const file of required) if (typeof file !== "string" || !seen.has(file)) throw new Error(`Portable package missing required file: ${file}`);
  if (manifest.template.entry !== "src/template/entry.tsx" || manifest.template.design !== "design.md") throw new Error("Portable package entry or design path is invalid.");
  for (const file of [manifest.styles.shared, ...manifest.styles.template]) {
    if (!file.endsWith(".css") || !seen.has(file)) throw new Error(`Portable package references missing CSS file: ${file}`);
  }
  const packageManifest = JSON.parse(payload.get("package.json").toString("utf8"));
  for (const [name, specifier] of Object.entries({ ...packageManifest.dependencies, ...packageManifest.devDependencies })) {
    if (!specifier || nonRegistryDependency.test(specifier)) throw new Error(`Non-portable package dependency: ${name}@${specifier}`);
  }
  const portableMetadata = JSON.parse(payload.get("template.json").toString("utf8"));
  for (const key of ["id", "name", "version", "category", "license", "variants", "compatibility", "entry", "design"]) {
    if (JSON.stringify(portableMetadata[key]) !== JSON.stringify(manifest.template[key])) throw new Error(`Portable package metadata mismatch: ${key}`);
  }
  return { root: packageRoot, manifest, manifestBytes: await readFile(path.join(packageRoot, "forma.install.json")), payload, packageManifest };
}

function parseArgs(args) {
  const result = {};
  for (let index = 0; index < args.length; index += 1) {
    const option = args[index];
    if (option === "--" || !option) continue;
    if (option === "--dry-run") { result.dryRun = true; continue; }
    if (option === "--help" || option === "-h") { result.help = true; continue; }
    if (!["--id", "--out"].includes(option)) throw new Error(`Unknown option: ${option}`);
    const value = args[++index];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for ${option}`);
    result[option.slice(2)] = value;
  }
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) console.log("Usage: pnpm template:export -- --id <template-id> [--out <new-directory>]");
    else {
      if (!options.id) throw new Error("--id is required.");
      const result = await createPortablePackage({ id: options.id, outDir: options.out ?? path.join("dist", "exports", options.id) });
      console.log(`Exported ${result.id}@${result.version} to ${result.output}`);
      console.log(`SHA-256: ${result.manifest.integrity.contentHash}`);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
