# Testing

## Mandatory local checks

```powershell
pnpm registry:check
pnpm typecheck
pnpm test
pnpm build
```

- Registry validation checks metadata shape, IDs, category references, variants, compatibility, license, source files, and generated output drift.
- Vitest + RTL covers category/registry handling, theme/accent switching, dialog focus/Escape/cancel behavior, catalog flow, and Modern Admin order creation/search/confirmation.
- Production build checks Vite resolution and bundles the live template.

## Browser checks

Install Chromium if needed: `pnpm --filter @design-templates/showcase exec playwright install chromium`. Run `pnpm test:e2e`. E2E covers gallery/detail/theme, responsive overflow, search shortcut, and CSV download; screenshots are written to `apps/showcase/test-results/` for review. Current V1 captures visual artifacts but does not compare committed golden snapshots, so manual visual review remains necessary.

## Responsive and accessibility review

Check 1440px, 820px, and 390px widths. Verify no horizontal page overflow, mobile navigation access, category wrapping, reduced motion, visible focus, modal focus restoration, and dark/light contrast. Preview itself can horizontally scroll for fixed device widths by design.
