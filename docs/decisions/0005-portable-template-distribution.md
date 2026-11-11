# Decision 0005: Portable template distribution

- **Status:** Accepted
- **Date:** 2026-11-11

## Context

Forma templates imported workspace packages such as `@design-templates/ui`, used shared token CSS and Tailwind configuration, and depended on the showcase Vite environment. Consumers could not install a template independently. Existing project layouts also vary too much for safe automated file merging.

## Decision

- Add local `template:export` that vendors only required template source, shared UI/theme/utilities, token/UI CSS, dependency metadata, design notes, and attribution into a SHA-256 checked bundle.
- Add Vite and Next.js App Router adapters in `template:install`; preserve same template/shared source and vary only app entry, global style wiring, and framework config.
- Install only to a target path that does not exist. Build in sibling staging directory, exclusively reserve target, move staged files, and remove installer-created output on failure. Never merge/overwrite.
- Refuse frameworks not marked tested; offer explicit `--experimental` only for proof runs before compatibility metadata is updated.
- Keep local package as V1 source. Defer authenticated GitHub fetching until immutable-ref and credential handling contract is specified.

## Alternatives

- Keep `workspace:*` package imports: simplest in Forma, unusable outside workspace.
- Copy shared UI separately into every template: creates design/behavior drift.
- Install directly into arbitrary existing project: difficult to reason about ownership, dependency versions, and rollback.
- Add remote GitHub fetch immediately: requires auth, private-repository access policy, ref resolution, and credential-safe UX beyond local proof scope.

## Reasons

Vendoring shared source keeps visual and interaction behavior consistent without requiring Forma workspace access. Clean-target-only install sharply limits destructive risk. Per-template compatibility evidence prevents a successful adapter from becoming a blanket framework claim.

## Tradeoffs

- Bundle duplicates shared source and requires re-export when shared UI changes.
- SHA-256 detects accidental/tampered payload changes but does not authenticate publisher or pin npm dependency resolution.
- Installer cannot merge existing apps; consumers must start from a clean target.
- Google Fonts remains runtime network dependency; system fallback remains available.
- Each template/framework pair needs its own integration proof.
