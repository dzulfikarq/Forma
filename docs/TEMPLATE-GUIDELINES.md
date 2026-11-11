# Template guidelines

## Required layout

```text
templates/<stable-id>/
├── template.json
├── design.md
├── package.json
├── tsconfig.json
├── previews/
│   ├── preview.png
│   └── preview-mobile.png
└── src/
    ├── entry.tsx
    ├── <template>.tsx
    └── <template>.test.tsx
```

Start with `pnpm template:new`. Scaffold creates template metadata, design-analysis notes, source entry, shared UI/token starter, package and TypeScript config, and an interaction test. It does not create placeholder screenshots: registry remains invalid until actual desktop/mobile previews are captured from the running implementation.

## Metadata and category contract

Metadata requires stable ID matching folder/package name, name, description, category, tags, semver version, source entry, desktop/mobile preview paths, `previewGeneration: "playwright"`, design spec, compatibility status, one or more theme variants (exactly one default), dependencies, license + attribution, and test paths.

- Category IDs come from `registry/categories.json` or an inline `{ "id", "name", "description" }` object. Registry builder merges inline categories. Showcase must not contain a duplicate template/category catalog.
- `dependencies` must match runtime/peer dependencies in package manifest. Package version/name must match template metadata and expose `typecheck` and `test` scripts.
- Paths must remain inside `templates/<id>/`; entry must default-export component. All listed source, design, preview, and test files must exist.
- Preview sources must be real PNG screenshots captured by `pnpm template:preview -- --id <id>`. Desktop and mobile sources are copied to generated public assets during `pnpm registry:build`.
- Compatibility uses `tested` only after independent package installation, typecheck, production build, and browser smoke test against named framework. Results apply per-template; do not infer support from another template. Current evidence is tracked in `docs/FRAMEWORK-COMPATIBILITY.md`.
- License and attribution must be reviewed for any external code or assets. Prefer original assets. Never imply a license from availability alone.

## Portable distribution

- Export with `pnpm template:export -- --id <id> [--out <new-directory>]`. Bundle includes template source, vendored shared UI/theme/utilities, token and UI styles, sanitized Tailwind/PostCSS config, dependency manifest, metadata, `design.md`, attributions, and SHA-256 file manifest. Workspace imports and Vite globs are rejected/removed.
- Install with `pnpm template:install -- --id <id> --package <bundle-dir> --framework <react-vite|next-app-router> --target <new-dir> [--variant <id>] [--dry-run]`. Installer validates hashes, paths, dependencies, ID, variant, and tested framework status; stages and rolls back failed writes. Existing targets are always refused. V1 is not a safe merge tool for populated projects.
- `--experimental` is proof-only escape hatch for untested adapters. Do not publish compatibility as `tested` until independent typecheck, production build, and browser smoke pass.
- Plus Jakarta Sans loads from Google Fonts and remains a runtime network asset; bundle records SIL Open Font License 1.1 attribution and system fallback. Shared UI behavior and template CSS stay the same across adapters.
- Local bundle is current distribution path. GitHub fetching remains deferred; future remote refs must be semver release tags or full commit SHA, never branches. No automatic release/publish.

## Typography, UI, and behavior

- Compact & Balanced Typography: `--font-size-body` default is 14px; visible UI text must be at least 12px. Use shared Plus Jakarta Sans and semantic typography/line-height tokens.
- Browser quality gate checks actual rendered font sizes, page/content overflow, and responsive layout at 375px mobile, 820px tablet, and 1366px desktop.
- Decorative text below 12px is allowed only when explicitly marked `data-type-exempt="decorative"`. Never exempt actionable labels, status, metadata, or help text.
- Use shared UI components and tokens; responsive content wraps/reflows rather than reducing text. Use accessible custom dialogs with focus management, Escape, and cancel paths.
- All shown controls must work locally or clearly explain placeholder/mock behavior. No native browser dialogs. Mock data must be labeled; do not imply persistence/API behavior.

## Reference analysis and submission

Analyze references before implementation. For image/video, record dimensions, representative frames, visible structure, typography, interaction evidence, and unknowns. For websites/repos, inspect relevant routes/code and licenses/attribution. Record observations, source, assumptions, responsive behavior, and deviations in `design.md`. Do not call a result pixel-perfect without measured verification.

Run after adding a template:

```powershell
pnpm install
pnpm template:preview -- --id <id>
pnpm registry:build
pnpm registry:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Do not hand-edit `registry/registry.json` or generated showcase preview copies. CI runs validation only and does not publish releases. Distribution refs must be semver tags or full commit SHAs, never branches. Repository remains private; do not publish without explicit visibility approval.
