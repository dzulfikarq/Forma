# Forma release readiness checklist

Release remains manual. CI validates; it does not publish. Do not change repository visibility or integrate Project Generator as part of this checklist.

## Source and metadata

- [ ] Review changes, licenses, attribution, and mock/local-only behavior.
- [ ] Keep template IDs stable; align template metadata, package version, and release version using semver.
- [ ] Capture desktop/mobile previews from the running implementation; run `pnpm registry:build` and `pnpm registry:check`.
- [ ] Mark each framework `tested` only after that template passes independent export/install, dependency install, typecheck, production build, and production-browser smoke. Record actual versions/results in `docs/FRAMEWORK-COMPATIBILITY.md` and `docs/TESTING.md`.
- [ ] Confirm portable package has no workspace references, non-registry dependencies, unsafe paths, missing attribution, or unverified compatibility claims.

## Validation

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm test:distribution`
- [ ] `pnpm build`
- [ ] `pnpm test:e2e` and review browser artifacts when Chromium is available.
- [ ] For every claimed adapter, install into a clean target outside the workspace; run `pnpm install`, `pnpm typecheck`, `pnpm build`, then its browser smoke against the production server.
- [ ] Verify theme/accent, Plus Jakarta Sans fallback, dialogs, visible UI text minimum 12px, 14px body default, and 375px/820px responsive behavior after install.
- [ ] Export bundle again and verify SHA-256, dependency-manifest consistency, compatibility gating, and no-overwrite behavior.

## Distribution approval

- [ ] Pin release registry source to a semver tag or full commit SHA; never a branch. Protect tags and record their resolved commit SHA.
- [ ] Follow [`DISTRIBUTION.md`](DISTRIBUTION.md) for any future authenticated private-repository fetch. Current distribution remains local-only.
- [ ] Confirm no token, credential, or private source is copied into generated projects, logs, artifacts, or release notes.
- [ ] Obtain explicit approval before external publication or repository visibility changes. Do not publish automatically.
- [ ] Review final diff and commit locally. Do not push unless explicitly instructed.
