# Design Templates

Reusable, token-driven React templates and shared UI foundations. Forma includes a searchable showcase, `modern-admin`, and `focus-planner` as Phase 2 workflow proof. Modern Admin is an original implementation informed by a user-provided dashboard video; it is not pixel-perfect. React + Vite is the only tested framework integration.

## Start on Windows

Requirements: Node.js 20+ and pnpm 12.

```powershell
pnpm install
pnpm dev
```

Open `http://localhost:5173`. Checks:

```powershell
pnpm registry:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

First Playwright run may need `pnpm --filter @design-templates/showcase exec playwright install chromium`.

## Workspace

- `apps/showcase`: Vite catalog, live preview, component gallery, Vitest, Playwright.
- `packages/ui`: local shadcn-style components backed by Radix UI and Motion for React.
- `packages/tokens`: semantic color, typography, spacing, radius, shadow, and motion tokens.
- `packages/utilities`: shared `cn` helper.
- `templates/*`: standalone React sources, design notes, metadata, Playwright desktop/mobile previews, and tests.
- `registry/`: category source metadata and generated registry contract.
- `scripts/build-registry.mjs`: validates template metadata/files and generates registry plus preview assets.
- `scripts/template-new.mjs`: scaffolds template metadata, React entry, package config, design notes, and tests.

## Add a template

Start with the scaffold CLI. Existing categories use their stable ID; a new category is declared inline and merged into the generated catalog:

```powershell
pnpm template:new -- --name "Sprint Board" --category project-management `
  --description "A focused sprint planning workspace." `
  --variant "blue:Blue:215 75% 48%" --variant "green:Green:145 55% 38%"
```

Before implementation, analyze supplied screenshots/images, representative video frames, design files, websites, or repositories. Record observed facts, unknowns, interaction evidence, responsive assumptions, and asset/code licenses in `design.md`. Build the real React UI with shared components and tokens; keep controls functional and mock data labeled. No AI generation service is part of this workflow.

Then run and validate:

```powershell
pnpm install
pnpm template:preview -- --id sprint-board
pnpm registry:build
pnpm registry:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Scaffold creates metadata, design notes, source entry, package config, and a runnable test starter. Implement the component and tests, then capture both PNG previews from the running Vite app. Registry build validates the previews, metadata, package dependencies, test files, and entry before copying both previews and adding the template/category to the data-driven showcase. No gallery catalog edits are needed. See [template guidelines](docs/TEMPLATE-GUIDELINES.md) and [agent workflow](docs/AGENT-WORKFLOW.md).

Typography gate uses Compact & Balanced Typography: 14px body default, 12px minimum visible UI text. Browser tests check font sizes, horizontal overflow, and the live template at 375px, 820px, and desktop width. Decorative text exceptions must use `data-type-exempt="decorative"`.

## Distribution

Generated local registry marks `distribution.immutable: false` and `ref: null`. Distribution requires a semver tag or full commit SHA, e.g. `pnpm registry:build --ref=v1.0.0`; branch refs are rejected. CI validates only and does not publish releases. This GitHub repository is private, so no public distribution is enabled. No backend, database, or Project Generator integration is included.

## Current limits

Mock data only; no persistence or API. Playwright preview PNGs are generated from running templates; browser tests do not compare golden screenshots. Next.js and frameworks beyond React + Vite remain untested. Plus Jakarta Sans loads from Google Fonts with system fallback.

See [docs/PRD.md](docs/PRD.md), [architecture](docs/ARCHITECTURE.md), and [testing](docs/TESTING.md).
