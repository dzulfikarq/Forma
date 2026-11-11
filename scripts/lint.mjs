import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoots = ["apps", "packages", "templates", "scripts"];
const sourceExtensions = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs"]);
const forbidden = /(?:\bwindow|\bglobalThis)\s*\.\s*(?:alert|confirm|prompt)\s*\(|(?<![\w$.])(?:alert|confirm|prompt)\s*\(/;

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return ["node_modules", "dist", "test-results"].includes(entry.name) ? [] : sourceFiles(target);
    return sourceExtensions.has(path.extname(entry.name)) ? [target] : [];
  }));
  return files.flat(Infinity);
}

const files = (await Promise.all(sourceRoots.map((directory) => sourceFiles(path.join(root, directory))))).flat();
const errors = [];
for (const file of files) {
  const source = await readFile(file, "utf8");
  if (forbidden.test(source)) errors.push(`${path.relative(root, file)}: use an accessible in-app dialog instead of native browser dialogs`);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else console.log(`Repository lint passed: ${files.length} source files checked; no native blocking dialogs.`);
