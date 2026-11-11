# Template guidelines

## Required layout

```text
templates/<stable-kebab-id>/
├── template.json
├── design.md
├── preview.svg
├── package.json
├── tsconfig.json
└── src/
    ├── entry.tsx
    ├── <template>.tsx
    └── <template>.test.tsx
```

Template metadata requires stable id, name/description, category, tags, version, source entry, preview, design spec, compatibility status, one or more theme variants (exactly one default), dependencies, license + attribution, and tests. Source entry default-exports React component. Use shared UI/tokens; mock data must be identified. Keep template dependencies aligned with imports.

Categories may be existing IDs from `registry/categories.json`; a new category can be declared inline as `{ "id", "name", "description" }`. The registry builder merges it. Do not hardcode category IDs in showcase.

## Compatibility claims

Use `tested` only after building/integrating against named framework. Mark other targets `untested`; absence is not implied support. React + Vite is tested in this repository. Next.js and other adapters are not.

## Preview

Provide original preview image/SVG or correctly licensed and attributed asset. Keep preview representative of implementation. Showcase derives preview URL from stable template id and generator copies preview to public assets.

## Submission

Run `pnpm registry:build`, `pnpm registry:check`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm test:e2e` where browser exists. Do not hand-edit generated registry. For release use immutable tag/SHA; never publish invalid metadata or branch ref.
