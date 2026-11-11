import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const showcaseRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(showcaseRoot, "../..");
const require = createRequire(import.meta.url);
const playwrightCli = require.resolve("@playwright/test/cli");
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function runPlaywright(id, outputDirectory, accent) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [playwrightCli, "test", "e2e/preview-generation.spec.ts", "--project=chromium"], {
      cwd: showcaseRoot,
      env: { ...process.env, PREVIEW_TEMPLATE_ID: id, PREVIEW_OUTPUT_DIR: outputDirectory, PREVIEW_ACCENT: accent },
      stdio: "inherit"
    });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`Playwright exited with code ${code}`)));
  });
}

const id = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
if (!id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
  console.error("Usage: pnpm template:preview -- --id <template-id>");
  process.exitCode = 1;
} else {
  try {
    const templateDirectory = path.join(repositoryRoot, "templates", id);
    const metadataPath = path.join(templateDirectory, "template.json");
    const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
    if (metadata.id !== id) throw new Error(`Template metadata ID does not match '${id}'.`);
    const outputDirectory = path.join(templateDirectory, "previews");
    const defaultAccent = metadata.variants.find((variant) => variant.default)?.accent;
    if (!defaultAccent) throw new Error(`${id}: missing default theme variant.`);
    await runPlaywright(id, outputDirectory, defaultAccent);

    const desktop = await readFile(path.join(outputDirectory, "preview.png"));
    const mobile = await readFile(path.join(outputDirectory, "preview-mobile.png"));
    if (!desktop.subarray(0, 8).equals(pngSignature) || !mobile.subarray(0, 8).equals(pngSignature)) throw new Error("Playwright did not produce valid PNG previews.");
    metadata.preview = `templates/${id}/previews/preview.png`;
    metadata.previewMobile = `templates/${id}/previews/preview-mobile.png`;
    metadata.previewGeneration = "playwright";
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
    console.log(`Captured live desktop/mobile previews for ${id}. Run pnpm registry:build, then quality checks.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
