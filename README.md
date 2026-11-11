# Design Templates

Reusable, token-driven React templates and shared UI foundations. V1 includes a searchable showcase and `modern-admin`, an original implementation informed by the user-provided dashboard video. It is not pixel-perfect and only claims React + Vite compatibility because that integration is built and tested here.

## Start on Windows

Requirements: Node.js 20+ and pnpm 12.

```powershell
pnpm install
pnpm dev
```

Open `http://localhost:5173`. Checks:

```powershell
pnpm registry:check
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
- `templates/modern-admin`: standalone React source, design notes, metadata, preview, and tests.
- `registry/`: category source metadata and generated registry contract.
- `scripts/build-registry.mjs`: validates template metadata/files and generates registry plus preview assets.

## Add a template

Create `templates/<stable-id>/` with `template.json`, `design.md`, `preview.svg` (or update generator for another format), React entry under `src/entry.tsx`, and runnable tests. Add category to `registry/categories.json`, or define a new category object in template metadata (`category: { "id": "stable-id", "name": "Display name", "description": "..." }`). Then run:

```powershell
pnpm registry:build
pnpm registry:check
pnpm typecheck
pnpm test
pnpm build
```

Showcase loads entries with a Vite glob and categories/templates from generated registry, not an app-side catalog. Read [template guidelines](docs/TEMPLATE-GUIDELINES.md) and [agent workflow](docs/AGENT-WORKFLOW.md).

## Distribution

Generated local registry marks `distribution.immutable: false` and `ref: null`. Release generation requires a semver tag or full commit SHA, e.g. `pnpm registry:build --ref=v1.0.0`. Publish only validated immutable refs. No backend, database, or Project Generator integration is included.

## Current limits

Mock data only; no persistence or API. Browser visual test captures screenshots but does not compare committed golden images yet. Next.js and React frameworks beyond Vite remain untested. Typography uses native system sans fonts; no remote font or image assets.

See [docs/PRD.md](docs/PRD.md), [architecture](docs/ARCHITECTURE.md), and [testing](docs/TESTING.md).
