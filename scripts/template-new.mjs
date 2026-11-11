import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const stableId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slug(value) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function parseArgs(args) {
  const options = { variants: [], tags: [] };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--") continue;
    if (arg === "--help" || arg === "-h") options.help = true;
    else if (["--name", "--category", "--category-name", "--category-description", "--description", "--variant", "--tags"].includes(arg)) {
      const value = args[++index];
      if (!value || value.startsWith("--")) throw new Error(`Missing value for ${arg}`);
      const key = arg.slice(2);
      if (key === "variant") options.variants.push(value);
      else if (key === "tags") options.tags.push(...value.split(",").map((tag) => tag.trim()).filter(Boolean));
      else options[key] = value;
    } else throw new Error(`Unknown option: ${arg}`);
  }
  return options;
}

function variantFrom(value, index) {
  const [id, name, ...accentParts] = value.split(":");
  const accent = accentParts.join(":").trim();
  if (!stableId.test(id ?? "") || !name?.trim() || !/^\d+(?:\.\d+)?\s+\d+(?:\.\d+)?%\s+\d+(?:\.\d+)?%$/.test(accent)) {
    throw new Error(`Invalid variant '${value}'. Use id:Name:Hue Saturation% Lightness%.`);
  }
  const [, hue, saturation, lightness] = accent.match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
  if (Number(hue) > 360 || Number(saturation) > 100 || Number(lightness) > 100) throw new Error(`Variant accent out of range: ${value}`);
  return { id, name: name.trim(), accent, default: index === 0 };
}

function componentName(id) {
  return id.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join("");
}

function json(value) {
  return JSON.stringify(value, null, 2) + "\n";
}

function jsxText(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("{", "&#123;").replaceAll("}", "&#125;");
}

export async function createTemplate(options, repositoryRoot = root) {
  const name = options.name?.trim();
  const description = options.description?.trim();
  const categoryId = options.category?.trim();
  const id = slug(name ?? "");
  if (!name || !description || !categoryId) throw new Error("--name, --category, and --description are required.");
  if (!stableId.test(id)) throw new Error(`Name must produce a stable kebab-case ID: ${name}`);
  if (!stableId.test(categoryId)) throw new Error(`Invalid category ID: ${categoryId}`);

  const categoryList = JSON.parse(await readFile(path.join(repositoryRoot, "registry/categories.json"), "utf8"));
  const existingCategory = categoryList.find((category) => category.id === categoryId);
  const category = existingCategory ?? {
    id: categoryId,
    name: options["category-name"]?.trim(),
    description: options["category-description"]?.trim()
  };
  if (!category.name || !category.description) throw new Error(`New category '${categoryId}' needs --category-name and --category-description.`);
  if (existingCategory && ((options["category-name"] && options["category-name"] !== existingCategory.name) || (options["category-description"] && options["category-description"] !== existingCategory.description))) {
    throw new Error(`Category '${categoryId}' already exists with different metadata.`);
  }

  const variants = (options.variants.length ? options.variants : ["base:Base:24 95% 53%"]).map(variantFrom);
  if (new Set(variants.map((variant) => variant.id)).size !== variants.length) throw new Error("Variant IDs must be unique.");
  const directory = path.join(repositoryRoot, "templates", id);
  try { await access(directory); throw new Error(`Template directory already exists: ${id}`); }
  catch (error) { if (error.code !== "ENOENT") throw error; }

  const component = componentName(id);
  const componentFile = `${id}.tsx`;
  const testFile = `${id}.test.tsx`;
  const tags = [...new Set(options.tags.length ? options.tags : id.split("-"))];
  const metadata = {
    id, name, description, category: existingCategory ? categoryId : category, tags, version: "0.1.0",
    entry: `templates/${id}/src/entry.tsx`, preview: `templates/${id}/previews/preview.png`, previewMobile: `templates/${id}/previews/preview-mobile.png`,
    previewGeneration: "pending", design: `templates/${id}/design.md`,
    compatibility: [{ framework: "React + Vite", status: "untested" }], variants,
    dependencies: ["react", "@design-templates/ui"],
    license: { type: "MIT", attribution: "Original implementation; no third-party template code or imagery." },
    tests: [`templates/${id}/src/${testFile}`]
  };
  const manifest = {
    name: `@design-templates/${id}`, version: metadata.version, private: true, type: "module",
    scripts: { typecheck: "tsc --noEmit", test: `vitest run --config ../../apps/showcase/vite.config.ts src/${testFile}` },
    dependencies: { "@design-templates/ui": "workspace:*" },
    peerDependencies: { react: "^18.0.0 || ^19.0.0" },
    devDependencies: {
      "@testing-library/jest-dom": "^6.9.1", "@testing-library/react": "^16.3.0", "@testing-library/user-event": "^14.6.1",
      "@types/react": "^19.1.16", "@types/react-dom": "^19.1.9", typescript: "^5.9.3", vitest: "^3.2.4"
    }
  };
  const files = new Map([
    ["template.json", json(metadata)],
    ["package.json", json(manifest)],
    ["tsconfig.json", json({ extends: "../../tsconfig.base.json", compilerOptions: { types: ["react", "react-dom"] }, include: ["src"] })],
    ["design.md", `# ${name}\n\n## Reference analysis\n- Source: not supplied yet. Analyze every supplied image, video, design file, website, or repository before implementation.\n- Observed structure and evidence: pending.\n- Typography, spacing, color, and surface tokens: pending.\n- Interactions and states: pending.\n- Responsive assumptions and unknowns: pending.\n- Asset/code licenses and attribution: original implementation; no external assets copied.\n- Deviations after implementation: pending.\n`],
    [`src/${componentFile}`, `import * as React from "react";\nimport { Button, Card, CardContent, CardHeader, CardTitle } from "@design-templates/ui";\nimport "./${id}.css";\n\nexport function ${component}() {\n  const [count, setCount] = React.useState(0);\n  return <main className="${id}" aria-labelledby="${id}-title"><section><p className="${id}__eyebrow">Template starter</p><h1 id="${id}-title">${jsxText(name)}</h1><p>${jsxText(description)}</p><Card><CardHeader><CardTitle>Replace this starter</CardTitle></CardHeader><CardContent><p>Use shared UI components and semantic tokens.</p><Button onClick={() => setCount((value) => value + 1)}>Interactions: {count}</Button></CardContent></Card></section></main>;\n}\n\nexport default ${component};\n`],
    [`src/${id}.css`, `.${id} { min-height: 100%; padding: 32px; background: hsl(var(--background)); color: hsl(var(--foreground)); font-family: var(--font-family-sans); font-size: var(--font-size-body); line-height: var(--line-height-body); }\n.${id} section { width: min(100%, 720px); margin: 0 auto; }\n.${id} h1 { margin: 8px 0; font-size: var(--font-size-page); line-height: var(--line-height-heading); }\n.${id}__eyebrow { color: hsl(var(--accent)); font-size: var(--font-size-helper); font-weight: var(--font-weight-bold); }\n.${id} .ui-card { margin-top: 24px; }\n@media (max-width: 640px) { .${id} { padding: 20px 16px; } }\n`],
    ["src/entry.tsx", `export { ${component} as default, ${component} } from "./${id}";\n`],
    [`src/${testFile}`, `import * as React from "react";\nimport "@testing-library/jest-dom/vitest";\nimport { render, screen } from "@testing-library/react";\nimport userEvent from "@testing-library/user-event";\nimport { describe, expect, it } from "vitest";\nimport { ThemeProvider } from "@design-templates/ui";\nimport { ${component} } from "./${id}";\n\ndescribe(${json(name).trim()}, () => {\n  it("renders and keeps its primary interaction functional", async () => {\n    const user = userEvent.setup();\n    render(<ThemeProvider><${component} /></ThemeProvider>);\n    await user.click(screen.getByRole("button", { name: "Interactions: 0" }));\n    expect(screen.getByRole("button", { name: "Interactions: 1" })).toBeInTheDocument();\n  });\n});\n`]
  ]);

  await mkdir(path.join(directory, "src"), { recursive: true });
  await writeFile(path.join(directory, "template.json"), files.get("template.json"));
  for (const [file, contents] of files) if (file !== "template.json") await writeFile(path.join(directory, file), contents);
  return { id, directory };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      console.log('Usage: pnpm template:new -- --name "Name" --category category-id --description "..." [--variant "id:Name:Hue Saturation% Lightness%"]');
      process.exit(0);
    }
    const result = await createTemplate(options);
    console.log(`Template scaffold created: ${path.relative(root, result.directory)}`);
    console.log("Next: analyze references, implement UI/tests, run pnpm install, generate Playwright previews, then build and validate registry.");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
