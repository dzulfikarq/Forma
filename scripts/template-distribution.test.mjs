import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cp, mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { createPortablePackage, buildPortablePackage, root, validatePortablePackage } from "./template-export.mjs";
import { installPortableTemplate } from "./template-install.mjs";

async function temporaryDirectory() {
  return mkdtemp(path.join(root, ".template-distribution-test-"));
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

test("portable export vendors dependencies and stays workspace-independent across templates", async (t) => {
  const modern = await buildPortablePackage("modern-admin");
  const focus = await buildPortablePackage("focus-planner");
  const staywise = await buildPortablePackage("staywise-host-dashboard");

  for (const bundle of [modern, focus, staywise]) {
    assert.ok(bundle.payload.has("src/template/entry.tsx"));
    assert.ok(bundle.payload.has("src/forma/ui.tsx"));
    assert.ok(bundle.payload.has("src/forma/theme.tsx"));
    assert.ok(bundle.payload.has("styles/forma.css"));
    assert.ok(bundle.payload.has("design.md"));
    assert.ok(bundle.payload.has("ATTRIBUTIONS.md"));
    const packageJson = JSON.parse(bundle.payload.get("package.json").toString("utf8"));
    assert.ok(packageJson.dependencies.react);
    assert.ok(packageJson.dependencies["@radix-ui/react-dialog"]);
    for (const [file, value] of bundle.payload) {
      const text = value.toString("utf8");
      assert.doesNotMatch(text, /workspace:|import\.meta\.glob|\.\.\/\.\.\/(?:packages|templates|apps)\//, file);
      assert.doesNotMatch(text, /@design-templates\//, file);
    }
  }
  assert.equal(modern.manifest.template.id, "modern-admin");
  assert.equal(focus.manifest.template.id, "focus-planner");
  assert.equal(staywise.manifest.template.id, "staywise-host-dashboard");
});

test("export verifies payload hashes and rejects unsafe manifest paths", async (t) => {
  const temp = await temporaryDirectory();
  t.after(() => rm(temp, { recursive: true, force: true }));
  const output = path.join(temp, "modern-admin");
  await createPortablePackage({ id: "modern-admin", outDir: output, repositoryRoot: root });
  const bundle = await validatePortablePackage(output);
  assert.equal(bundle.manifest.integrity.algorithm, "sha256");
  assert.ok(bundle.manifest.source.ref === null || /^[a-f0-9]{40,64}$/i.test(bundle.manifest.source.ref));

  const manifestPath = path.join(output, "forma.install.json");
  const originalManifest = JSON.parse(await readFile(manifestPath, "utf8"));
  for (const unsafePath of ["../outside.txt", "C:/outside.txt", "CON.txt", "conin$.log", "LPT³", "folder/trailing. "]) {
    const manifest = structuredClone(originalManifest);
    manifest.files[0].path = unsafePath;
    await writeFile(manifestPath, JSON.stringify(manifest));
    await assert.rejects(validatePortablePackage(output), /Invalid or duplicate payload record/);
  }
  const alteredAlgorithm = structuredClone(originalManifest);
  alteredAlgorithm.integrity.algorithm = "sha1";
  await writeFile(manifestPath, JSON.stringify(alteredAlgorithm));
  await assert.rejects(validatePortablePackage(output), /must declare SHA-256/);

  const alteredDependencies = structuredClone(originalManifest);
  alteredDependencies.dependencies.runtime.react = "file:../react";
  await writeFile(manifestPath, JSON.stringify(alteredDependencies));
  await assert.rejects(validatePortablePackage(output), /dependency manifest mismatch/);

  const packageManifestPath = path.join(output, "package.json");
  const originalPackageManifest = await readFile(packageManifestPath);
  const invalidPackageManifest = JSON.parse(originalPackageManifest.toString("utf8"));
  invalidPackageManifest.dependencies["lucide-react"] = "file:../lucide-react";
  const invalidPackageBytes = `${JSON.stringify(invalidPackageManifest, null, 2)}\n`;
  const invalidDependencyManifest = structuredClone(originalManifest);
  invalidDependencyManifest.dependencies.runtime["lucide-react"] = "file:../lucide-react";
  invalidDependencyManifest.files.find((record) => record.path === "package.json").sha256 = sha256(invalidPackageBytes);
  invalidDependencyManifest.integrity.contentHash = sha256(invalidDependencyManifest.files.map((record) => `${record.path}\0${record.sha256}\n`).sort().join(""));
  await writeFile(packageManifestPath, invalidPackageBytes);
  await writeFile(manifestPath, JSON.stringify(invalidDependencyManifest));
  await assert.rejects(validatePortablePackage(output), /Non-registry package dependency/);

  await writeFile(packageManifestPath, originalPackageManifest);
  await writeFile(manifestPath, JSON.stringify(originalManifest));

  const sourcePath = path.join(output, "src/forma/utilities.ts");
  const originalSource = await readFile(sourcePath);
  await writeFile(sourcePath, `${originalSource.toString("utf8")}\n// tampered`);
  await assert.rejects(validatePortablePackage(output), /Package integrity mismatch/);
  await writeFile(sourcePath, originalSource);
  await validatePortablePackage(output);
});

test("installer dry-run, theme selection, compatibility gate, and conflict refusal", async (t) => {
  const temp = await temporaryDirectory();
  t.after(() => rm(temp, { recursive: true, force: true }));
  const packageDir = path.join(temp, "package");
  const parent = path.join(temp, "projects");
  await mkdir(parent);
  await createPortablePackage({ id: "modern-admin", outDir: packageDir, repositoryRoot: root });

  const target = path.join(parent, "modern-admin-vite");
  const dryRun = await installPortableTemplate({ id: "modern-admin", packageDir, framework: "react-vite", target, variant: "violet", dryRun: true });
  assert.equal(dryRun.status, "dry-run");
  assert.equal(dryRun.variant.id, "violet");
  await assert.rejects(readFile(target), { code: "ENOENT" });

  const unmarkedPackage = path.join(temp, "unmarked-package");
  await cp(packageDir, unmarkedPackage, { recursive: true });
  const unmarkedManifestPath = path.join(unmarkedPackage, "forma.install.json");
  const manifest = JSON.parse(await readFile(unmarkedManifestPath, "utf8"));
  manifest.template.compatibility = [];
  const unmarkedMetadataPath = path.join(unmarkedPackage, "template.json");
  const portableMetadata = JSON.parse(await readFile(unmarkedMetadataPath, "utf8"));
  portableMetadata.compatibility = [];
  const metadataBytes = `${JSON.stringify(portableMetadata, null, 2)}\n`;
  await writeFile(unmarkedMetadataPath, metadataBytes);
  manifest.files.find((record) => record.path === "template.json").sha256 = sha256(metadataBytes);
  manifest.integrity.contentHash = sha256(manifest.files.map((record) => `${record.path}\0${record.sha256}\n`).sort().join(""));
  await writeFile(unmarkedManifestPath, JSON.stringify(manifest));
  await assert.rejects(installPortableTemplate({ id: "modern-admin", packageDir: unmarkedPackage, framework: "next-app-router", target, variant: "ember", dryRun: true }), /not marked tested/);

  const staywisePackage = path.join(temp, "staywise-package");
  await createPortablePackage({ id: "staywise-host-dashboard", outDir: staywisePackage, repositoryRoot: root });
  for (const framework of ["react-vite", "next-app-router"]) {
    const tested = await installPortableTemplate({ id: "staywise-host-dashboard", packageDir: staywisePackage, framework, target, dryRun: true });
    assert.equal(tested.framework.compatibility, "tested");
  }

  await mkdir(target);
  await writeFile(path.join(target, "keep.txt"), "existing data");
  await assert.rejects(installPortableTemplate({ id: "modern-admin", packageDir, framework: "react-vite", target, variant: "ember" }), /never overwrites/);
  assert.equal(await readFile(path.join(target, "keep.txt"), "utf8"), "existing data");
});

test("installer emits self-contained Vite app and report", async (t) => {
  const temp = await temporaryDirectory();
  t.after(() => rm(temp, { recursive: true, force: true }));
  const packageDir = path.join(temp, "package");
  const target = path.join(temp, "installed");
  await createPortablePackage({ id: "modern-admin", outDir: packageDir, repositoryRoot: root });
  const result = await installPortableTemplate({ id: "modern-admin", packageDir, framework: "react-vite", target, variant: "ember" });
  assert.equal(result.status, "installed");
  const appPackage = JSON.parse(await readFile(path.join(target, "package.json"), "utf8"));
  assert.equal(appPackage.dependencies.react, "^19.0.0");
  assert.equal(appPackage.devDependencies.vite, "^7.3.8");
  assert.match(await readFile(path.join(target, "src/main.tsx"), "utf8"), /defaultAccent="24 95% 53%"/);
  assert.match(await readFile(path.join(target, "src/template/modern-admin.tsx"), "utf8"), /\.\.\/forma\/ui/);
  assert.equal(JSON.parse(await readFile(path.join(target, "forma-install-report.json"), "utf8")).status, "installed");
});
