# Design system quick reference

Detailed requirements: [component standards](docs/COMPONENT-STANDARDS.md). Tokens live in `packages/tokens/src/styles.css`; shared components live in `packages/ui/src/`.

## Typography

Default font system sans. Compact defaults: page title 22px, section title 18px, card title 16px, body/button/input 14px, table 13–14px, label 13px, helper/badge 12px, KPI 24–28px. Token utilities live in `apps/showcase/tailwind.config.js`. Landing hero may exceed scale. Fix narrow layouts with wrapping/responsive layout before reducing type.

## Tokens

Semantic HSL CSS variables drive light/dark surfaces and accent. Shared tokens cover typography, spacing, radius, shadows, and motion. Use theme context for mode/accent. Template variants change accent token only; no component duplication. Respect `prefers-reduced-motion`.
