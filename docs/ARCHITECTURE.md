# Architecture

## Workspace boundaries

`apps/showcase` is the only executable app. It imports tokens/UI/utilities and template entries. `packages/ui` owns local shared components styled in Tailwind; Radix provides accessible primitives, Motion handles reduced-motion-aware transitions. `packages/tokens` owns global semantic CSS variables. `templates/<id>` owns self-contained React UI, design notes, metadata, preview, and tests.

Templates use React source and shared package imports rather than Vite-specific APIs. This improves portability but is not a compatibility guarantee; only React + Vite is tested. Future adapters may supply framework entry points without rewriting design primitives.

## Registry data flow

`registry/categories.json` and `templates/*/template.json` are source metadata. `scripts/build-registry.mjs` validates uniqueness, category references, variants, license/attribution, compatibility states, required source files, and safe paths. It emits deterministic `registry/registry.json` and copies preview assets to showcase public directory. Vite imports generated registry and discovers template entries with `import.meta.glob`; category filtering has no hardcoded category list.

Registry schema version is explicit. Unpublished local registry uses `ref: null`, `immutable: false`. Release generation accepts only semantic version tags or full SHA; consumers should pin immutable ref. Registry validates source metadata before generation/build. Project Generator contract remains a GitHub-readable JSON file; integration not tested.

## Theme/data flow

`ThemeProvider` exposes light/dark and accent token. Root `data-theme` supports portaled Radix layers. CSS semantic HSL tokens map Tailwind colors. Templates choose theme variants by setting accent only. Mock UI state remains local React state.

## Runtime interactions

Template is imported into showcase and rendered as live React component, not iframe. Preview width is controlled by a scrollable viewport; tablet/mobile buttons affect actual layout width. Components and interactions are local mock behavior. No external API calls.

## Quality boundaries

Registry contract and template API are stable-ID based; package internals are source-first for V1. No backend, persistence, publish service, server-side rendering, or framework adapters are present.
