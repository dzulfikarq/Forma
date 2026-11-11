# Design system quick reference

Detailed requirements: [component standards](docs/COMPONENT-STANDARDS.md). Tokens live in `packages/tokens/src/styles.css`; shared components live in `packages/ui/src/`.

## Typography

Use Plus Jakarta Sans, served by Google Fonts under SIL Open Font License 1.1, with the system sans stack as fallback. Shared size and line-height tokens live in `packages/tokens/src/styles.css`; Tailwind utilities map to those tokens in `apps/showcase/tailwind.config.js`.

| Role | Token | Size |
| --- | --- | --- |
| Desktop hero | `--font-size-hero` | 40–48px; responsive on mobile |
| Page heading | `--font-size-page` | 24px |
| Section heading | `--font-size-section` | 22px |
| Card title | `--font-size-card` | 18px |
| Body and card description | `--font-size-body` | 14px |
| Navigation | `--font-size-nav` | 14px |
| Button and input | `--font-size-button`, `--font-size-input` | 14px |
| Category and label | `--font-size-category`, `--font-size-label` | 13px |
| Badge and helper/footer | `--font-size-badge`, `--font-size-helper` | 12px |

Keep UI text at 12px or larger. Pair display text with `--line-height-display`, headings with `--line-height-heading`, and body copy with `--line-height-body`. Prefer the semantic tokens over literal sizes; fix narrow layouts with wrapping and responsive layout before reducing type.

This Compact & Balanced Typography scale is browser-checked at mobile, tablet, and desktop widths. Intentional decorative text below 12px needs `data-type-exempt="decorative"`; never exempt labels or controls.

## Tokens

Semantic HSL CSS variables drive light/dark surfaces and accent. Shared tokens cover typography, spacing, radius, shadows, and motion. Use theme context for mode/accent. Template variants change accent token only; no component duplication. Respect `prefers-reduced-motion`.
