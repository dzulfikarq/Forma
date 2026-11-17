# Decision 0006: Light Premium Showcase presentation

- **Status:** Accepted
- **Date:** 2026-11-17

## Context

The Showcase Gallery and Template Detail pages needed a more polished marketplace presentation while retaining Forma's existing navigation, template interactions, and live React previews. Template source UI, registry metadata contracts, and distribution behavior remain outside this design scope.

## Decision

- Use light mode with violet accent as the Showcase default; preserve user-controlled light/dark switching and style both modes with shared semantic tokens.
- Refine Gallery hero, registry summary, search, category filters, template cards, and responsive grid within the existing page structure.
- Derive template, category, framework, theme, and compatibility presentation from registry data; do not add a duplicate catalog.
- Refine Detail sidebar and preview frame without replacing or snapshotting the interactive template component.
- Keep responsive behavior across mobile, tablet, and desktop, preserve keyboard access, visible focus, and reduced-motion support.

## Alternatives

- Keep dark mode as default: rejected because selected Light Premium reference calls for a light-neutral entry experience.
- Add a separate marketplace shell or redesign each template: rejected because it expands scope and risks changing established flows and template identity.
- Hardcode showcase counts or compatibility labels: rejected because registry is source of truth and values drift as catalog changes.

## Reasons

This keeps the visual change in the Showcase layer, aligns the initial experience with the selected reference, and preserves existing interactions. Registry-derived summaries and status avoid duplicated metadata; live previews continue using the actual React entries.

## Tradeoffs

- Showcase CSS now owns more presentation detail and needs responsive/theme regression coverage.
- New registry categories, frameworks, and compatibility states flow into the UI automatically, but layout still needs review if metadata grows substantially.
- Gallery hero illustration remains decorative UI, not a template screenshot or claim of framework support.
