# Architecture

## Workspace boundaries

`apps/showcase` is the repository demo app. It imports tokens/UI/utilities and template entries. `packages/ui` owns local shared components styled in Tailwind; Radix provides accessible primitives, Motion handles reduced-motion-aware transitions. `packages/tokens` owns global semantic CSS variables. `templates/<id>` owns React UI, design notes, metadata, preview, and tests.

Templates use framework-neutral React source and shared package imports rather than Vite APIs. `scripts/template-export.mjs` vendors shared UI, theme provider, utilities, token/UI CSS, template source, dependency manifest, design notes, attribution, and sanitized Tailwind config into an integrity-checked local package. It rewrites workspace imports and excludes test files. Export package format is `forma-portable-template` v1; SHA-256 detects payload drift, not publisher identity.

`scripts/template-install.mjs` installs only into a new target directory. It validates package integrity, template ID, theme variant, framework compatibility, dependencies, and parent/target paths; stages all files, reserves the new target exclusively, then moves staged files. Failure removes only installer-created target content. Existing targets are refused, never merged or overwritten. V1 adapters generate Vite entry/config or Next.js App Router client page/server layout while retaining identical template and shared UI source. Authenticated GitHub fetch is deferred; local package path is the only source.

Portable compatibility is evidence-based. Modern Admin passed independent Vite and Next.js App Router production builds and browser smoke checks; other templates must pass their own adapter checks before metadata claims compatibility. See [framework compatibility](FRAMEWORK-COMPATIBILITY.md).

## Registry data flow

`registry/categories.json` and `templates/*/template.json` are source metadata. `scripts/template-new.mjs` scaffolds template files; `apps/showcase/scripts/generate-preview.mjs` loads source entries in a running Vite app and captures desktop/mobile PNGs with Playwright. `scripts/build-registry.mjs` validates metadata, category/variant contracts, package dependency alignment, compatibility, tests, source files, and safe paths. It emits deterministic `registry/registry.json` and copies both previews to the showcase public directory. Vite imports generated registry and discovers entries with `import.meta.glob`; category filtering has no hardcoded catalog.

Registry schema version is explicit. Unpublished local registry uses `ref: null`, `immutable: false`. Distribution generation accepts only semantic version tags or full SHA; consumers should pin immutable refs. Export source ref is a full SHA only when all source and adapter inputs are clean; otherwise it is null. GitHub Actions validates only and does not publish releases. Repository is private. Project Generator remains untouched.

## Theme/data flow

`ThemeProvider` exposes light/dark and accent token. Root `data-theme` supports portaled Radix layers. CSS semantic HSL tokens map Tailwind colors. Templates choose theme variants by setting accent only. Mock UI state remains local React state.

## Runtime interactions

Template is imported into showcase and rendered as live React component, not iframe. Preview width is controlled by a scrollable viewport; tablet/mobile buttons affect actual layout width. Components and interactions are local mock behavior. No external API calls.

## Quality boundaries

Compact & Balanced Typography is browser-checked: body default 14px, visible UI text minimum 12px, and responsive overflow checks at 375/820/1366px. Decorative exceptions require `data-type-exempt="decorative"`. No backend, persistence, publish service, authenticated GitHub fetch, AI generation, or Project Generator integration is present.
