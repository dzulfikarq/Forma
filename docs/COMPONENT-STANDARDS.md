# Component standards

## Shared UI

Import reusable controls from `@design-templates/ui`: Button/loading, Input, Textarea, Select, Checkbox, Switch, Card, Badge, Tooltip, DropdownMenu, Dialog, AlertDialog/ConfirmDialog, Toast, Table/Pagination, Tabs, Skeleton, EmptyState, ErrorState, Sidebar, Topbar, Breadcrumb, and ResponsiveNavigation. Components are local shadcn-style composition over Radix. Add a component only when a real template/showcase needs it.

## Accessibility

- Use semantic elements, visible labels, accessible names, and status announcements.
- Radix dialogs handle focus trap/return, keyboard navigation, and Escape dismissal. Alert/confirm dialogs require explicit action and cancel; confirm destructive changes before mutation.
- Keep focus-visible styling; preserve keyboard operability for navigation, tabs, dropdowns, selects, and forms.
- Never call native `window.alert`, `window.confirm`, or `window.prompt`.
- Respect reduced motion; no information conveyed only by color.

## Tokens and typography

Use semantic colors, not fixed light/dark palette values, for shared controls. `--accent` drives primary/accent surfaces. Use Plus Jakarta Sans via `--font-family-sans` with the system sans fallback. Global type and line-height tokens live in `packages/tokens/src/styles.css`; Tailwind utilities map to the same tokens.

- Hero: 40–48px desktop, responsive on mobile.
- Page/section: 24px / 22px; card title: 18px.
- Body/description: 14–16px (14px default); navigation, buttons, and inputs: 14px.
- Category tabs and labels: 13px; badges and helper/footer: 12–13px.
- UI text must not fall below 12px. Use shared size/line-height tokens instead of one-off values; reflow or wrap narrow layouts instead of shrinking text.
- Compact & Balanced Typography is the quality gate: body defaults to 14px, visible UI text stays at least 12px, and responsive layouts reflow without clipping or horizontal page overflow. Mark intentional decorative text with `data-type-exempt="decorative"`; never exempt functional labels.
- Plus Jakarta Sans is distributed under SIL Open Font License 1.1; fallback remains available when Google Fonts cannot load.

## States and behavior

Asynchronous-looking UI needs loading, error, and empty representation when relevant. Every visible action must have a real local behavior or an explicit disabled/placeholder explanation. Keep mock data labeled. Avoid unnecessary dependencies; charts can use SVG/CSS if needs remain small.
