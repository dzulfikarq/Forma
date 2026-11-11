import { access, lstat, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { adapterDependencies, validatePortablePackage } from "./template-export.mjs";

function modulePath(fromFile, targetFile) {
  let value = path.posix.relative(path.posix.dirname(fromFile), targetFile);
  if (!value.startsWith(".")) value = `./${value}`;
  if (/\.[cm]?[jt]sx?$/.test(value)) value = value.replace(/\.[cm]?[jt]sx?$/, "");
  return value;
}

function safePath(base, relative) {
  if (typeof relative !== "string" || !relative || relative.includes("\\") || relative.includes("\0") || path.posix.isAbsolute(relative) || relative.split("/").some((part) => !part || part === "." || part === "..")) {
    throw new Error(`Unsafe installation path: ${relative}`);
  }
  const absolute = path.resolve(base, ...relative.split("/"));
  const escaped = path.relative(base, absolute);
  if (escaped.startsWith("..") || path.isAbsolute(escaped)) throw new Error(`Installation path escapes target: ${relative}`);
  return absolute;
}

async function assertCleanTarget(target) {
  const parent = path.dirname(target);
  let cursor = path.parse(parent).root;
  for (const segment of path.relative(cursor, parent).split(path.sep).filter(Boolean)) {
    cursor = path.join(cursor, segment);
    const stat = await lstat(cursor).catch(() => null);
    if (!stat?.isDirectory() || stat.isSymbolicLink()) throw new Error(`Target parent must be an existing real directory: ${cursor}`);
  }
  const existing = await lstat(target).catch((error) => {
    if (error.code === "ENOENT") return null;
    throw error;
  });
  if (existing) throw new Error(`Target already exists; installer never overwrites: ${target}`);
}

function cssImports(manifest, fromFile) {
  return [manifest.styles.shared, ...manifest.styles.template]
    .map((file) => `import ${JSON.stringify(modulePath(fromFile, file))};`)
    .join("\n");
}

function adapterFiles({ framework, manifest, variant, packageManifest }) {
  const accent = variant.accent;
  const templateImport = modulePath(framework === "react-vite" ? "src/main.tsx" : "app/page.tsx", manifest.template.entry);
  const themeImport = modulePath(framework === "react-vite" ? "src/main.tsx" : "app/page.tsx", "src/forma/theme.tsx");
  const files = new Map();
  files.set("pnpm-workspace.yaml", "allowBuilds:\n  esbuild: true\n");
  if (framework === "react-vite") {
    files.set("index.html", `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <meta name="theme-color" content="#191b1d" />\n    <link rel="preconnect" href="https://fonts.googleapis.com" />\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />\n    <title>${manifest.template.name}</title>\n  </head>\n  <body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>\n</html>\n`);
    files.set("src/main.tsx", `import React from "react";\nimport { createRoot } from "react-dom/client";\n${cssImports(manifest, "src/main.tsx")}\nimport { ThemeProvider } from "./forma/theme";\nimport Template from "./template/entry";\n\ncreateRoot(document.getElementById("root")!).render(<React.StrictMode><ThemeProvider defaultTheme="dark" defaultAccent=${JSON.stringify(accent)}><Template /></ThemeProvider></React.StrictMode>);\n`);
    files.set("vite.config.ts", `import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\n\nexport default defineConfig({ plugins: [react()] });\n`);
    files.set("tsconfig.json", JSON.stringify({ compilerOptions: { target: "ES2022", useDefineForClassFields: true, lib: ["ES2022", "DOM", "DOM.Iterable"], module: "ESNext", skipLibCheck: true, moduleResolution: "Bundler", allowImportingTsExtensions: true, resolveJsonModule: true, isolatedModules: true, noEmit: true, jsx: "react-jsx", strict: true, types: ["vite/client"] }, include: ["src", "vite.config.ts"] }, null, 2) + "\n");
    packageManifest.scripts = { dev: "vite --host 0.0.0.0", build: "tsc --noEmit && vite build", typecheck: "tsc --noEmit" };
  } else {
    const tailwindConfig = packageManifest.__tailwind;
    const before = 'content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx,mdx}"],';
    if (!tailwindConfig.includes(before)) throw new Error("Cannot adapt Tailwind content paths for Next.js.");
    packageManifest.__tailwind = tailwindConfig.replace(before, 'content: ["./app/**/*.{js,jsx,ts,tsx,mdx}", "./src/**/*.{js,jsx,ts,tsx,mdx}"],');
    files.set("app/layout.tsx", `import type { ReactNode } from "react";\nimport "./globals.css";\n\nexport const metadata = { title: ${JSON.stringify(manifest.template.name)}, description: ${JSON.stringify(manifest.template.description)} };\n\nexport default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {\n  return <html lang="en"><head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" /></head><body>{children}</body></html>;\n}\n`);
    files.set("app/globals.css", `@import "../${manifest.styles.shared}";\n${manifest.styles.template.map((file) => `@import "../${file}";`).join("\n")}\n`);
    files.set("app/page.tsx", `"use client";\n\nimport Template from "${templateImport}";\nimport { ThemeProvider } from "${themeImport}";\n\nexport default function Page() {\n  return <ThemeProvider defaultTheme="dark" defaultAccent=${JSON.stringify(accent)}><Template /></ThemeProvider>;\n}\n`);
    files.set("next.config.ts", `import type { NextConfig } from "next";\n\nconst nextConfig: NextConfig = {};\nexport default nextConfig;\n`);
    files.set("tsconfig.json", JSON.stringify({ compilerOptions: { target: "ES2017", lib: ["dom", "dom.iterable", "esnext"], allowJs: true, skipLibCheck: true, strict: true, noEmit: true, esModuleInterop: true, module: "esnext", moduleResolution: "bundler", resolveJsonModule: true, isolatedModules: true, jsx: "preserve", incremental: true, plugins: [{ name: "next" }] }, include: ["next-env.d.ts", ".next/types/**/*.ts", "**/*.ts", "**/*.tsx"], exclude: ["node_modules"] }, null, 2) + "\n");
    files.set("next-env.d.ts", `/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n\n// NOTE: This file should not be edited\n// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.\n`);
    packageManifest.scripts = { dev: "next dev", build: "next build", start: "next start", typecheck: "tsc --noEmit" };
  }
  return files;
}

async function writeStageFile(stage, relative, contents) {
  const destination = safePath(stage, relative);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, contents, { flag: "wx" });
}

async function moveStagedFiles(stage, target) {
  for (const entry of await readdir(stage, { withFileTypes: true })) {
    const source = path.join(stage, entry.name);
    const destination = path.join(target, entry.name);
    if (entry.isDirectory()) {
      await mkdir(destination);
      await moveStagedFiles(source, destination);
    } else if (entry.isFile()) {
      await rename(source, destination);
    } else {
      throw new Error(`Unexpected staged entry: ${source}`);
    }
  }
}

export async function installPortableTemplate({ id, packageDir, framework, target: targetInput, variant: variantId, dryRun = false, allowUntested = false }) {
  const adapter = adapterDependencies[framework];
  if (!adapter) throw new Error(`Unsupported framework adapter: ${framework}`);
  if (!id || !packageDir || !targetInput) throw new Error("Template ID, package directory, and target are required.");
  const bundle = await validatePortablePackage(packageDir);
  const manifest = bundle.manifest;
  if (manifest.template.id !== id) throw new Error(`Package ID mismatch: requested ${id}, package contains ${manifest.template.id}.`);
  const compatibility = manifest.template.compatibility.find((item) => item?.framework === adapter.framework);
  if (compatibility?.status !== "tested" && !allowUntested) throw new Error(`${adapter.framework} is not marked tested for ${id}; installation refused.`);
  const variants = manifest.template.variants;
  const variantIds = new Set();
  for (const item of variants) {
    if (!item || typeof item !== "object" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id ?? "") || variantIds.has(item.id) || !/^(?:\d+(?:\.\d+)?)\s+\d+(?:\.\d+)?%\s+\d+(?:\.\d+)?%$/.test(item.accent ?? "")) {
      throw new Error("Portable package contains invalid or duplicate theme variants.");
    }
    variantIds.add(item.id);
  }
  if (variants.filter((item) => item.default === true).length !== 1) throw new Error("Portable package must define exactly one default theme variant.");
  const variant = variants.find((item) => item.id === variantId) ?? (variantId ? null : variants.find((item) => item.default));
  if (!variant) throw new Error(`Unknown theme variant: ${variantId ?? "(no default)"}`);

  const target = path.resolve(targetInput);
  await assertCleanTarget(target);
  const payload = new Map(bundle.payload);
  payload.set("forma.install.json", bundle.manifestBytes);
  const packageManifest = structuredClone(bundle.packageManifest);
  const selectedAdapter = adapterDependencies[framework];
  packageManifest.dependencies = { ...packageManifest.dependencies, ...selectedAdapter.dependencies };
  packageManifest.devDependencies = { ...packageManifest.devDependencies, ...selectedAdapter.devDependencies };
  if (framework === "next-app-router") packageManifest.__tailwind = payload.get("tailwind.config.js").toString("utf8");
  const generated = adapterFiles({ framework, manifest, variant, packageManifest });
  if (framework === "next-app-router") payload.set("tailwind.config.js", packageManifest.__tailwind);
  delete packageManifest.__tailwind;
  packageManifest.name = `${id}-forma-app`;
  packageManifest.private = true;
  payload.set("package.json", `${JSON.stringify(packageManifest, null, 2)}\n`);

  for (const [file, contents] of generated) {
    if (file !== "package.json" && payload.has(file)) throw new Error(`Adapter file conflicts with template payload: ${file}`);
    payload.set(file, contents);
  }
  const instructions = `# ${manifest.template.name} · Forma install\n\nFramework: ${adapter.framework}\nTheme: ${variant.name}\n\nRun pnpm install, then pnpm dev. Production validation: pnpm typecheck and pnpm build.\n\nTemplate interactions use local mock data where indicated in design.md.\n`;
  payload.set("FORMA-INSTALL.md", instructions);
  const report = {
    status: dryRun ? "dry-run" : "installed",
    template: { id, version: manifest.template.version },
    framework: { id: framework, name: adapter.framework, compatibility: compatibility?.status ?? "untested" },
    variant: { id: variant.id, name: variant.name },
    target,
    fileCount: payload.size + 1,
    commands: ["pnpm install", "pnpm typecheck", "pnpm build", "pnpm dev"]
  };
  const reportBytes = `${JSON.stringify(report, null, 2)}\n`;
  if (!dryRun) {
    payload.set("forma-install-report.json", reportBytes);
    const parent = path.dirname(target);
    const stage = await mkdtemp(path.join(parent, `.${path.basename(target)}.forma-stage-`));
    let reservedTarget = false;
    try {
      for (const [relative, contents] of payload) await writeStageFile(stage, relative, contents);
      await assertCleanTarget(target);
      await mkdir(target);
      reservedTarget = true;
      await moveStagedFiles(stage, target);
      await rm(stage, { recursive: true, force: true });
    } catch (error) {
      await rm(stage, { recursive: true, force: true });
      if (reservedTarget) await rm(target, { recursive: true, force: true });
      throw error;
    }
  }
  return { ...report, files: [...payload.keys()].sort() };
}

function parseArgs(args) {
  const result = {};
  const flags = new Set(["--dry-run", "--experimental", "--help", "-h"]);
  for (let index = 0; index < args.length; index += 1) {
    const option = args[index];
    if (option === "--") continue;
    if (flags.has(option)) {
      if (option === "--dry-run") result.dryRun = true;
      if (option === "--experimental") result.allowUntested = true;
      if (option === "--help" || option === "-h") result.help = true;
      continue;
    }
    if (!["--id", "--package", "--framework", "--target", "--variant"].includes(option)) throw new Error(`Unknown option: ${option}`);
    const value = args[++index];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for ${option}`);
    result[{ "--package": "packageDir", "--target": "target" }[option] ?? option.slice(2)] = value;
  }
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      console.log("Usage: pnpm template:install -- --id <id> --package <export-dir> --framework <react-vite|next-app-router> --target <new-dir> [--variant <id>] [--dry-run] [--experimental]");
    } else {
      const result = await installPortableTemplate(options);
      console.log(`${result.status}: ${result.template.id}@${result.template.version} → ${result.framework.name} (${result.variant.name})`);
      console.log(`Target: ${result.target}`);
      console.log(`Files: ${result.fileCount}; run: ${result.commands.slice(0, 3).join(" → ")}`);
      if (result.framework.compatibility !== "tested") console.warn("Experimental install: framework compatibility is not yet verified.");
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
