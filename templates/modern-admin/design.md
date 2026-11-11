# Modern Admin

## Reference analysis

Source: user-provided `referensi template.mp4` (6.9 seconds, 1280×720). Frames show a dark charcoal commerce operations dashboard. Persistent narrow left rail; top search/date/profile bar; compact cards; orange active navigation and chart accents. Overview has sales summary, target chart, wallet and circular target indicator. Sales view switches between channel-oriented insights. Orders view uses a four-lane dispatch board. UI uses rounded charcoal surfaces, fine separators, dense but readable labels, and restrained motion. Video shows navigation and tab changes; detailed behavior beyond visible interactions is not inferred.

## Implementation

- Original React implementation inspired by visible layout; not pixel-perfect.
- Shared semantic color, typography, radius, spacing, shadow, and motion tokens.
- Default Ember orange accent; Violet accent alternative. Accent is CSS-token driven.
- Mock commerce data is for showcase only. No external API or persistence.
- Navigation, tabs, search shortcut, filters, date range, theme, accent, settings, CSV downloads, order creation, and destructive confirmation are implemented.
- Charts are inline SVG/CSS; no charting dependency.

## Responsive behavior

Desktop uses fixed navigation rail and multi-column overview. At tablet widths cards reflow; mobile uses a compact top bar, horizontal navigation, and one-column panels. Reduced-motion preference disables nonessential transitions.

## Compatibility

React + Vite is exercised in this repository. Next.js and other framework compatibility remain untested.
