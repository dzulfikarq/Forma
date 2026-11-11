# Product requirements — V1

## Goal

Build a maintainable, reusable React template library that can later be consumed by Project Generator. V1 ships a local showcase and metadata contract, not a backend or generator integration.

## Users

- Developers browsing and adapting templates.
- Coding agents creating new templates from user-provided references.

## V1 scope

- pnpm workspace: Vite + React + strict TypeScript; Tailwind; local Radix/shadcn-style shared components; Lucide; Motion; Vitest/RTL; Playwright.
- Semantic light/dark and accent tokens, compact admin typography.
- Metadata-driven categories and template registry, validated before local generation.
- Search/filter gallery, template details, live responsive preview, theme variants, component showcase.
- Modern Admin: overview, sales/analytics, order kanban/list, settings; interactive mock state.
- Documentation and coding-agent workflow.

## Out of scope

Backend, database, auth, AI reference-to-code service, publishing automation, Project Generator changes, and untested framework claims.

## Acceptance

`pnpm install`, showcase dev server, typecheck, unit tests, registry check, and production build pass. Browser E2E/visual capture run when browser support exists. New valid template appears through metadata + generated registry without showcase catalog edits. Invalid metadata prevents registry generation.

## Status

Implementation tracked by source and test output. Do not treat design reference as pixel-perfect; Modern Admin is an original approximation of visible video layout and interactions.
