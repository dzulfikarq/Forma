# Coding-agent template workflow

Use this workflow when a user supplies an image/screenshot, video, `design.md`, website, or source repository. A coding agent performs analysis and implementation; Forma does not provide an integrated AI generation service.

## 1. Analyze references before coding

- Inspect every supplied source. For video, sample representative frames and note resolution, page changes, visible motion, typography, spacing, and interaction evidence. Do not infer behavior not shown.
- For websites/repos, inspect relevant routes and source structure. Check code, image, font, and icon licenses plus required attribution before reuse. Prefer original implementation; do not copy proprietary UI/assets without permission.
- Separate observed facts from assumptions and unknowns. Identify category/template type, responsive behavior, key states, and primary user flows.
- Record source, evidence, visual tokens, interactions, responsive assumptions, license/attribution, and deviations in `templates/<id>/design.md`.

## 2. Scaffold and implement

Start new template work with the CLI. Existing categories use registry IDs; new categories are declared inline and merged during registry build:

```powershell
pnpm template:new -- --name "Sprint Board" --category project-management `
  --description "A focused sprint planning workspace." `
  --variant "blue:Blue:215 75% 48%" --variant "green:Green:145 55% 38%"
```

- Scaffold creates stable kebab-case ID, `template.json`, `design.md`, package/TypeScript config, shared-token React entry, and a runnable interaction test. Replace the starter UI, not the registry/catalog.
- Keep template dependencies in sync with `package.json`. Do not duplicate template/category lists in app code; gallery and filters consume generated metadata and discover source entries by glob.
- Use `@design-templates/ui`, semantic tokens, accessible custom dialogs, keyboard/focus behavior, responsive layout, and working local interactions. No `window.alert`, `window.confirm`, or `window.prompt`. Label mock data and session-only behavior.
- Compact & Balanced Typography is mandatory: `--font-size-body` defaults to 14px; visible UI text minimum is 12px. Do not shrink text to fit. Reflow/wrap instead. Intentional decorative text may be excluded only with `data-type-exempt="decorative"`; functional labels never qualify.
- Set compatibility to `untested` until that template is independently installed, typechecked, production-built, and browser-smoke-tested on the named adapter. Modern Admin has proven React + Vite and Next.js App Router adapters; see `docs/FRAMEWORK-COMPATIBILITY.md`. Never transfer one template's result to another.

## 3. Generate previews from the running UI

After implementing the component and updating tests/design notes, install workspace changes and capture previews:

```powershell
pnpm install
pnpm template:preview -- --id <stable-id>
pnpm registry:build
pnpm registry:check
```

Playwright loads the template entry from the running Vite app and captures desktop (1366px) plus mobile (375px) PNGs using the default variant. The generator updates metadata only after both screenshots exist and pass PNG checks. Do not hand-author, substitute, or reuse unrelated preview artwork. Mobile preview is captured from the responsive implementation, not resized desktop output.

## 4. Validate and prepare distribution

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Registry validation rejects incomplete/pending previews, malformed metadata/variants/categories, path escapes/missing files, missing tests, dependency drift, and entries without a default export. Registry build copies desktop/mobile PNGs and generates catalog/category data; never hand-edit generated files. Browser checks cover live template font sizes, horizontal overflow, responsive layout at 375/820/1366px, gallery flow, variants, and key interactions. Review captured artifacts when browser is available.

### Portable export and install

Export locally; no GitHub request or release publish occurs:

```powershell
pnpm template:export -- --id modern-admin --out dist/exports/modern-admin
pnpm template:install -- --id modern-admin --package dist/exports/modern-admin `
  --framework react-vite --target <new-project-directory> --variant ember --dry-run
```

Remove `--dry-run` to install. Choose an adapter only when package metadata marks it `tested`. `--experimental` permits an explicit untested proof build and prints a warning; it is not a compatibility claim. Targets must not exist and parent directory must be a real directory. Run `pnpm install`, `pnpm typecheck`, and `pnpm build` in installed project. Installer never merges existing workspaces. GitHub fetching remains unimplemented; any future work must follow [`DISTRIBUTION.md`](DISTRIBUTION.md), and credentials must never enter package files or URLs.

Release registry refs must be immutable semver tags or full commit SHAs. CI validates only; no release/publish automation. Repository is private; do not publish externally without explicit visibility approval. Do not modify Project Generator.
