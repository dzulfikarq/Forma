# Ledgerline Finance

## Reference analysis

### Source and evidence

- One static image supplied in the user prompt, displayed at 1818 × 2048. No URL, source repository, or license statement accompanied it.
- Image shows a desktop personal-finance workspace inside a rounded white application frame. Large italic “After” heading and grey comparison canvas sit outside that frame; they are presentation context, not part of the app UI.
- Since image is the only evidence, visible layout and copy are observations; actions, hover states, routes, data rules, and mobile behavior are not confirmed.

### Observed layout and visual system

- **Shell:** light neutral canvas, white rounded application surface, pale lavender-grey left sidebar, thin grey dividers, compact top toolbar.
- **Sidebar:** brand and collapse control; Dashboard and Analytics; expandable Transactions group (All Transactions, Income, Expenses, Pending, Recurring Bills); Accounts group (Cards & Bank, Savings, Investments, Goals); Savings Goals and Budget Limits; Help Center, Settings, and profile at bottom.
- **Top toolbar:** Finance / Overview breadcrumb, transaction search with ⌘K hint, Export, Share, and blue Add Transaction action.
- **Overview heading:** Financial overview, April 2026 summary, small collaborator avatars.
- **KPI row:** Balance overview with orange dotted micro-chart and growth badge; Monthly income with blue bar chart and month-over-month change; Spending with green income-use progress.
- **Finance navigation:** Summary, Budget Board (selected), Transactions, Goals, plus Filter and year selector.
- **Budget board:** four equal lanes—Bills & Fixed, Daily Spending, Savings Goals, Income. Each lane has icon, count, overflow action, three sample cards, status badges, dates/notes, and dashed add action. Goal cards include progress bars and targets.
- **Color:** white surfaces, pale cool-grey/lilac board backgrounds, near-black text, blue primary action/chart, green positive progress/income, orange balance accents, muted red/amber/purple statuses. Values are visual estimates, not sampled source tokens.
- **Typography:** clean sans-serif UI; 14–16px body/control text, compact 12–13px metadata, medium-weight headings, large but restrained KPI values. The decorative serif word outside the app frame is not reproduced. Forma Plus Jakarta Sans and shared semantic tokens are used.
- **Motion:** static image provides no motion evidence. Implementation uses brief hover/focus transitions and honors reduced-motion preferences; no behavior is inferred from the source image.

### Interaction and responsive assumptions

- Screenshot exposes controls but does not prove their behavior. Local preview implements: sidebar collapse and section navigation; Ctrl/⌘K search; transaction filtering; year selection; CSV export; a share-link dialog with clipboard fallback; add transaction and goal dialogs; entry detail/status editing; board tabs and lane actions; analytics, account, budget, help, and settings views; FAQ, local preference switches, and feedback toasts.
- All finance records are illustrative and session-only. No bank, payment, email, or external share service is connected.
- Only desktop composition is visible in reference. Tablet uses a compact icon rail and two-column board; mobile hides sidebar, uses bottom navigation and a page chooser, stacks KPI/board cards, and wraps toolbars. These are implementation assumptions, not source observations.

## Implementation

- Original template name and sample identity: **Ledgerline Finance**. Existing `admin-cms` category fits its operations/dashboard layout; no category catalog changes.
- Theme variants: Cobalt (default, `224 82% 55%`) and Evergreen (`148 50% 37%`). Semantic surface/text tokens adapt to light and dark theme.
- Uses Forma shared Button, Card, Badge, Input, Label, Select, Switch, Textarea, Dialog, and Toast components. Charts use local SVG/CSS; icons use lucide-react. No external image or font added.
- Accessible dialogs use Radix focus management, labels, cancel paths, and keyboard dismissal. All visible actions have local behavior; no native browser dialogs.
- Deviations: brand, names, amounts, status data, and icons are original; screenshot branding and assets are not copied. Additional section content is an original functional extension because reference shows only one static screen.

## License and attribution

- User-provided screenshot is used only as visual reference. Its original source and license were not provided; no screenshot pixels, logo, proprietary code, or external assets are included.
- Template code and original UI are MIT. Existing Forma Plus Jakarta Sans is distributed under SIL Open Font License 1.1 with system fallback.

## Verification notes

- Compatibility remains `untested` until independent package installation, production build, and browser smoke test against React + Vite pass.
- Desktop and mobile previews were captured from the running implementation via `pnpm template:preview -- --id ledgerline-finance` and reviewed. Generated gallery copies via `pnpm registry:build`.
- Browser review targets 375px, 820px, and 1366px. Enforce 14px body default, 12px minimum visible UI text, and no horizontal overflow.
- Verification on 16 November 2026: `pnpm registry:build` and `pnpm registry:check` passed (5 templates, 7 categories); `pnpm lint` passed (47 source files); `pnpm typecheck` passed; `pnpm test` passed (26 tests and 4 distribution tests); `pnpm build` passed; `pnpm test:e2e` passed (8 passed, 1 opt-in preview-generation test skipped). Vite emitted a 526.94 kB chunk-size warning.
