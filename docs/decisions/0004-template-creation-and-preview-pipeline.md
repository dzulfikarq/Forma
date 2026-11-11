# Decision 0004: Template creation and preview pipeline

- **Status:** Accepted
- **Date:** 2026-11-11

## Context

Template creation was manual. New categories/templates required hand-built files, preview assets could be static placeholders, metadata validation did not confirm package dependencies, and no CI workflow enforced the registry/quality contract. Phase 2 needs a repeatable coding-agent workflow without an AI generator, Project Generator changes, or automatic publishing.

## Decision

- Add a small Node CLI that scaffolds required template files and metadata.
- Keep `template.json` as registry source of truth; derive catalog/category data and preview copies from it.
- Capture desktop/mobile PNG previews with Playwright by loading source entries directly from the Vite glob. Keep this route separate from catalog metadata so pending templates can be captured before registry acceptance.
- Reject pending/non-PNG previews, dependency drift, missing package scripts/files, unsafe paths, invalid variants/categories, and entries without a default export.
- Run registry, repository-policy lint, typecheck, tests, production build, and browser checks in validation-only GitHub Actions.
- Require immutable semver tags/full commit SHAs for distribution metadata. Do not create releases or publish automatically.

## Alternatives considered

- Hand-maintained template and category catalogs: rejected; creates drift and requires gallery edits for each template.
- Static/generated placeholder preview SVGs: rejected; can diverge from actual implementation.
- AI reference-to-code generation service: rejected; out of scope; coding agents analyze supplied references and implement templates.
- Automatic GitHub release/publish workflow: rejected; repository is private and CI must only validate.
- Add a lint dependency solely for one repository-specific rule: rejected; current lint command checks the explicit no-native-dialog policy, while TypeScript/tests/browser checks cover code quality.

## Tradeoffs

- Scaffold is intentionally small and opinionated; users may adapt generated React/CSS and tests.
- PNG captures add binary artifacts and can differ with fonts/browser versions; no pixel-golden comparison is claimed.
- Preview provenance relies on the capture CLI plus metadata/PNG validation; registry cannot cryptographically prove a screenshot was not edited afterward.
- New template packages require `pnpm install` to refresh workspace lock state.

## Consequences

New templates need no gallery catalog change. Registry generation is deterministic and invalid templates cannot build. Framework compatibility remains per-template and evidence-based. No Project Generator integration or publish automation exists.
