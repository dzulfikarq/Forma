# Agent instructions

- Scope: this repository only. Do not modify Project Generator or publish a remote without explicit visibility approval.
- Read `docs/AGENT-WORKFLOW.md`, `docs/COMPONENT-STANDARDS.md`, and `docs/TEMPLATE-GUIDELINES.md` before adding template work.
- Use strict TypeScript, shared UI components, semantic design tokens, and stable registry IDs. Do not duplicate template/category catalogs in app code.
- Keep all shown actions functional; label mock behavior. Never use `window.alert`, `window.confirm`, or `window.prompt`.
- Validate external assets/code licenses and attribution. Do not claim framework compatibility until integration tests exist.
- Run `pnpm registry:check`, `pnpm typecheck`, `pnpm test`, and `pnpm build`; run Playwright when browser is available. Record actual results, not intended results.
- Template release registry must use semver tag or full commit SHA. Branch references are not immutable.
- Document material architecture changes in `docs/decisions/` with context, alternatives, reasons, tradeoffs, and status.
- Start new templates with `pnpm template:new`; analyze supplied references and their licenses before coding. Use shared UI, semantic typography tokens, accessible custom dialogs, and responsive layouts.
- Generate desktop/mobile previews from the running implementation with `pnpm template:preview -- --id <id>`; then run `pnpm registry:build`. Registry rejects pending previews and invalid metadata.
- Compact & Balanced Typography gate: body default 14px, visible UI text minimum 12px. Decorative exceptions require `data-type-exempt="decorative"`.
- Run `pnpm lint` with registry, typecheck, tests, build, and Playwright before delivery. CI validates only; do not create or publish releases automatically.
