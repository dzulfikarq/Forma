# Testing

## Mandatory local checks

```powershell
pnpm registry:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
pnpm test:distribution
```

- Registry validation checks metadata shape, stable IDs, category references, variants, compatibility, license, entry/default export, package dependency alignment, preview PNGs, source files, and generated output drift.
- `pnpm lint` checks repository source for prohibited native blocking dialogs. CI also runs typecheck, tests, build, and browser checks; it never publishes.
- Vitest + RTL covers category/registry handling, theme/accent switching, dialog focus/Escape/cancel behavior, catalog flow, and Modern Admin order creation/search/confirmation.
- Production build checks Vite resolution and bundles every registered live template.
- `pnpm test:distribution` checks cross-template packaging, workspace-path removal, SHA-256 integrity, unsafe paths, compatibility gating, dry-run, theme selection, and no-overwrite conflicts.

## Browser checks

Install Chromium if needed: `pnpm --filter @design-templates/showcase exec playwright install chromium`. Run `pnpm test:e2e`. E2E covers gallery/detail/theme, responsive overflow, search shortcut, CSV download, live template interactions, and minimum typography at 375px, 820px, and desktop widths. Preview capture uses `pnpm template:preview -- --id <id>` to generate committed desktop/mobile PNGs from the running implementation. E2E artifacts are written to `apps/showcase/test-results/`; screenshots are not golden-image comparisons, so visual review remains necessary.

## Responsive and accessibility review

Check 1366px, 820px, and 375px widths. Verify no horizontal page overflow, visible text at least 12px, body default 14px, mobile navigation access, category wrapping, reduced motion, visible focus, modal focus restoration, and dark/light contrast. Preview stage may horizontally scroll for fixed device widths by design; template content must reflow.

## Independent distribution integration

### Repository checks (2026-11-11)

| Check | Result |
| --- | --- |
| `pnpm registry:check` | Pass — 3 templates, 7 categories |
| `pnpm lint` | Pass — 37 source files |
| `pnpm typecheck` | Pass — UI, showcase, and all templates |
| `pnpm test` | Pass — 7 Vitest files / 20 tests; 4 distribution tests |
| `pnpm build` | Pass — registry and Vite production build; 527.70 kB main chunk warning |
| `pnpm test:e2e` | Pass — 6 browser tests; 1 preview-generation test skipped |

Modern Admin proof used a local export and clean targets outside the Forma workspace:

| Target | Dependency install | Typecheck | Production build | Browser smoke |
| --- | --- | --- | --- | --- |
| React 19 + Vite 7.3.8 | Pass (`pnpm install`, esbuild allowed by generated pnpm config) | Pass | Pass | Pass: font, Violet accent, navigation, custom confirm/create dialogs, 375px overflow/typography |
| React 19 + Next.js 16.4.6 App Router | Pass | Pass | Pass | Pass on production server: font, Ember accent, navigation, custom confirm/create dialogs, 375px overflow/typography |
| Focus Planner + React 19/Vite 7.3.8 | Pass | Pass | Pass | Pass: font, Moss accent, task dialog/filter, typography, 375px overflow |

Re-run package checks with `pnpm template:export`, `pnpm template:install`, `node scripts/template-distribution.smoke.mjs <url> ["<H S L accent>"]`, or `node scripts/template-focus-smoke.mjs <url>`. Smoke scripts use Playwright already installed by showcase. Exact versions/status matrix: `docs/FRAMEWORK-COMPATIBILITY.md`. Next adapter proof was installed with `--experimental` while metadata was untested; after build and production browser smoke passed, metadata was marked tested. Focus Planner passed independent Vite install/build/browser smoke. Staywise compatibility is untested for portable distribution. No Project Generator or remote repository was used.
