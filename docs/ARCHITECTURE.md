# Architecture

## Workspace boundaries

`apps/showcase` is the only executable app. It imports tokens/UI/utilities and template entries. `packages/ui` owns local shared components styled in Tailwind; Radix provides accessible primitives, Motion handles reduced-motion-aware transitions. `packages/tokens` owns global semantic CSS variables. `templates/<id>` owns self-contained React UI, design notes, metadata, preview, and tests.

Templates use React source and shared package imports rather than Vite-specific APIs. This improves portability but is not a compatibility guarantee; only React + Vite is tested. Future adapters may supply framework entry points without rewriting design primitives.

## Registry data flow

`registry/categories.json` and `templates/*/template.json` are source metadata. `scripts/template-new.mjs` scaffolds template files; `apps/showcase/scripts/generate-preview.mjs` loads source entries in a running Vite app and captures desktop/mobile PNGs with Playwright. `scripts/build-registry.mjs` validates metadata, category/variant contracts, package dependency alignment, compatibility, tests, source files, and safe paths. It emits deterministic `registry/registry.json` and copies both previews to the showcase public directory. Vite imports generated registry and discovers entries with `import.meta.glob`; category filtering has no hardcoded catalog.

Registry schema version is explicit. Unpublished local registry uses `ref: null`, `immutable: false`. Distribution generation accepts only semantic version tags or full SHA; consumers should pin immutable refs. GitHub Actions validates only and does not publish releases. Repository is private. Project Generator remains untouched.

## Theme/data flow

`ThemeProvider` exposes light/dark and accent token. Root `data-theme` supports portaled Radix layers. CSS semantic HSL tokens map Tailwind colors. Templates choose theme variants by setting accent only. Mock UI state remains local React state.

## Runtime interactions

Template is imported into showcase and rendered as live React component, not iframe. Preview width is controlled by a scrollable viewport; tablet/mobile buttons affect actual layout width. Components and interactions are local mock behavior. No external API calls.

## Quality boundaries

Compact & Balanced Typography is browser-checked: body default 14px, visible UI text minimum 12px, and responsive overflow checks at 375/820/1366px. Decorative exceptions require `data-type-exempt="decorative"`. No backend, persistence, publish service, server-side rendering, AI generation, Project Generator integration, or framework adapters are present.
