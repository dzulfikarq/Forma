# Groundwork Finance

## Reference analysis

### Sources and evidence

- User video: `threadsdownloader.com_d5e4e7.mp4`, H.264, 1280 × 720, 6.64 seconds. Sampled at one-second intervals. It shows the Overview, Autopay, and Cash flow screens, then returns to Overview. Some intermediate frames catch page transitions; those are not treated as separate states.
- Supplied URL `https://demo.codeandchill.store/tolva/overview` returned 404 during review. The live demo root `https://demo.codeandchill.store/tolva/` loaded and was inspected directly. Its visible navigation links opened Overview, Autopay, Bills, Duty & tax, Cash flow, Reports, Projects, and Suppliers. Settings is available from the gear; Help is available from the More menu.
- The product page `https://codeandchill.store/templates/tolva` describes the remaining page structure and actions. Unseen behavior is treated as product-page documentation, not video evidence.

### Observed structure and visual system

- **Shell:** full-width forest-green canvas. Desktop uses a compact brand at left, centered rounded navigation, and search/theme/notification/profile/settings controls at right. Pages share the same shell. Mobile description specifies bottom-tab navigation.
- **Overview:** greeting and a circular automated-spend indicator share a row with three large cash KPIs. Next row pairs a 90-day balance chart with a seven-day payment schedule. Lower cards summarize automatic payments, bills needing review, category spend, and recent activity.
- **Autopay:** large page heading and three KPIs, followed by Rules / Run log / Pay-from tabs. Rules view has horizontal category chips, a wide editor (calendar day, cadence, fixed/cap amount, source account), and a narrower stack of rule cards with pause/edit controls.
- **Bills and invoices:** review queue, status filters, due dates, supplier/customer, project/category, amount, individual and bulk approval, and invoice status actions.
- **Cash flow:** Forecast / Accounts tabs, summary cards, weekly in/out chart, selectable 6/13-week horizon, what-if income adjustment, upcoming payments, account balances, and move-money action.
- **Duty & tax:** set-aside pots, target coverage, recurring sweep controls, upcoming filing dates, and reviewed/filing states.
- **Reports:** spend-by-category and monthly charts, top suppliers, report-builder filters, CSV export.
- **Projects:** drag-and-drop status board and a budget view with spent/committed amounts.
- **Suppliers:** category filters, sort modes, payment totals, contact details, and add/details actions.
- **Settings and Help:** business preferences, approval thresholds, appearance, local reset, FAQ accordion, and support form.
- **Color:** sampled screen is dominated by deep muted green (approximately `#435f39`), warm off-white cards (approximately `#f3f4e8`), nearly-black editor surfaces, pale sage/lime accents, and a restrained coral underline. Dark mode shifts the canvas and cards to charcoal/green-black.
- **Typography:** reference uses a rounded geometric sans with large lightweight greeting and numbers, bold section labels, and compact navigation/helper text. Forma Plus Jakarta Sans and semantic tokens replace reference font files; body defaults to 14px and visible UI text stays at least 12px.
- **Motion:** video shows animated page-heading/underline changes and active navigation. Live layout shows chart visualizations and selected states. Implementation uses restrained CSS page entrance, SVG line draw, hover lift, and state transitions; reduced-motion disables nonessential animation.
- **Responsive behavior:** product page states layout supports every screen and uses a bottom tab bar on phones. Implementation retains a compact top identity/actions row and bottom mobile navigation; grids collapse, filters wrap, editor panels stack, and data rows reflow.

## Implementation and interaction coverage

- Original dashboard branded **Groundwork Finance** with invented Cedarfield/Alder Grove sample data. No Tolva name/logo, source code, screenshots, proprietary font files, or third-party imagery are bundled.
- Existing `admin-cms` registry category fits an operations/finance workspace; no category catalog changes.
- Overview: selectable navigation/actions, payment schedule links, review-to-approve buttons, report/activity navigation, and sample bill creation.
- Autopay: Rules / Run log / Pay-from sections; category filters; selectable day, cadence, amount, cap mode, and account; save; create rule; accessible switches; local run review.
- Bills & invoices: status filter, row checkboxes, bulk approve, approve/mark-paid transitions, invoice draft/send/paid states, add forms, and CSV download.
- Cash flow: Forecast / Accounts tabs, 6/13-week chart toggle, what-if slider updates the forecast, account list, and local account transfer dialog.
- Duty & tax: editable sweep rate and toggle, local top-up/sweep dialog, and filing review actions.
- Reports: spend/builder tabs, category and date filters, report refresh state, and CSV download.
- Projects: Board / Budgets views, HTML drag-and-drop between stages, next-stage button, and project creation dialog.
- Suppliers: category and sort filters, supplier detail dialog, sample contact action, and add form.
- Settings: business name, approval threshold used by autopay copy, preferences/theme toggle, save feedback, and accessible destructive reset confirmation.
- Help: keyboard-accessible FAQ accordion and a session-only support-note form.
- `Ctrl/⌘ K` opens workspace search. Navigation and sample record results route to their corresponding views. Notifications and all feedback are local; they do not imply a connected bank, supplier, tax authority, or backend.
- Shared Forma `Button`, `Input`, `Label`, `Select`, `Switch`, `Card`, `Badge`, `Dialog`, `ConfirmDialog`, and `Toast` are used. Charts are inline SVG/CSS; no chart package or external asset was added. Plus Jakarta Sans comes from Forma's existing token setup.
- Theme variants: Grove (default, `105 26% 31%`) and Olive (`82 33% 32%`), both drive the semantic accent. Shared light/dark theme toggle changes scoped canvas/surface styling.

## License and attribution

Tolva's live page identifies itself as © 2026 Hasib (OVERSHOOT), all rights reserved, “licensed, not sold.” This repository includes no copied Tolva source, brand marks, images, screenshots, or fonts. All UI, sample data, CSS artwork, and code here are original; app code is MIT. Forma's existing Plus Jakarta Sans distribution is under SIL Open Font License 1.1 with system fallback.

## Verification notes

- Scaffold and metadata are generated through `pnpm template:new`; gallery registration is discovered from template metadata and the existing source-entry glob.
- Desktop/mobile previews were captured from the running entry with `pnpm template:preview -- --id groundwork-finance` and reviewed; no reference artwork is used. Mobile cash KPIs reflow to equal full-width cards, and weekly schedule uses two columns.
- Compatibility remains `untested` until this template passes independent package install, typecheck, production build, and browser smoke against the named adapter. Workspace checks alone do not establish portable compatibility.
- Visual review widths: 1366px, 820px, and 375px. Browser gates verify 14px body text, 12px minimum visible UI text, and no page/content overflow.
- Verification on 16 November 2026: `pnpm registry:build` and `pnpm registry:check` passed (4 templates, 7 categories); `pnpm lint` passed (43 files); `pnpm typecheck` passed; `pnpm test` passed (23 tests and 4 distribution tests); `pnpm build` passed; `pnpm test:e2e` passed (7 passed, 1 opt-in preview-generation test skipped). Vite emitted a chunk-size warning above 500 kB.
