# Testing

## Mandatory local checks

```powershell
pnpm registry:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

- Registry validation checks metadata shape, stable IDs, category references, variants, compatibility, license, entry/default export, package dependency alignment, preview PNGs, source files, and generated output drift.
- `pnpm lint` checks repository source for prohibited native blocking dialogs. CI also runs typecheck, tests, build, and browser checks; it never publishes.
- Vitest + RTL covers category/registry handling, theme/accent switching, dialog focus/Escape/cancel behavior, catalog flow, and Modern Admin order creation/search/confirmation.
- Production build checks Vite resolution and bundles every registered live template.

## Browser checks

Install Chromium if needed: `pnpm --filter @design-templates/showcase exec playwright install chromium`. Run `pnpm test:e2e`. E2E covers gallery/detail/theme, responsive overflow, search shortcut, CSV download, live template interactions, and minimum typography at 375px, 820px, and desktop widths. Preview capture uses `pnpm template:preview -- --id <id>` to generate committed desktop/mobile PNGs from the running implementation. E2E artifacts are written to `apps/showcase/test-results/`; screenshots are not golden-image comparisons, so visual review remains necessary.

## Responsive and accessibility review

Check 1366px, 820px, and 375px widths. Verify no horizontal page overflow, visible text at least 12px, body default 14px, mobile navigation access, category wrapping, reduced motion, visible focus, modal focus restoration, and dark/light contrast. Preview stage may horizontally scroll for fixed device widths by design; template content must reflow.
