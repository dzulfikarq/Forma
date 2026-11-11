# Changelog

## Phase 4 — Portable distribution and framework integration

- Added local SHA-256 verified export and clean-target installer with dry-run, compatibility/theme/dependency/path checks, staged writes, rollback, and install report.
- Export vendors Forma shared UI/theme/utilities and token/UI CSS; strips workspace dependencies, sanitizes Tailwind paths, and records font attribution.
- Proved Modern Admin independently on React + Vite and Next.js App Router with typechecks, production builds, and browser smoke tests; proved Focus Planner export/install/Vite build.
- Marked Next.js tested only for Modern Admin. GitHub authenticated fetching, merge installs, Project Generator, release publishing, and automatic publishing remain out of scope.

## Phase 2 — Template creation and publishing workflow

- Added `pnpm template:new` scaffold CLI, strict metadata/package/path validation, and automatic generated registry/category integration.
- Added Playwright desktop/mobile preview capture from the running template, Compact & Balanced Typography browser gates, repository lint, and validation-only GitHub Actions.
- Added Focus Planner in a metadata-defined Productivity category as end-to-end proof; updated distribution instructions to require immutable refs and kept releases manual/private.
- No Project Generator integration or Next.js compatibility claim.

## 0.1.0 — V1 baseline

- Added pnpm workspace with Vite/React showcase, shared token/UI/utilities packages, and Modern Admin template.
- Added generated registry, category metadata, theme variants, live responsive preview, tests, and agent/documentation workflow.
- Browser/CI status: see delivery report and test output; no release or remote publish implied.
