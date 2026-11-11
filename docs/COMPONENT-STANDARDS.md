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

Use semantic colors, not fixed light/dark palette values, for shared controls. `--accent` drives primary/accent surfaces. Default sizes: page 22px, section 18px, card 16px, body/button/input 14px, table 13–14px, label 13px, helper/badge 12px, KPI 24–28px. Landing page hero type may scale up. Don’t shrink text to solve narrow layouts; reflow/wrap first.

## States and behavior

Asynchronous-looking UI needs loading, error, and empty representation when relevant. Every visible action must have a real local behavior or an explicit disabled/placeholder explanation. Keep mock data labeled. Avoid unnecessary dependencies; charts can use SVG/CSS if needs remain small.
