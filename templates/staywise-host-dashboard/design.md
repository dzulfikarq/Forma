# Staywise Host Dashboard

## Reference and license review

- Supplied reference: `pinhome_my_bookings_dashboard-main.zip`, PinHome My Bookings Dashboard. The included screenshot is 1184 × 784; HTML/CSS/JS source contains all six dashboard sections and demo flows.
- Source repository includes MIT License, copyright LALUARIFTA (2026). This template is an original implementation; no source code, screenshot, SVG illustration, or external imagery was copied. Attribution is retained in `template.json` because reference informed the design.
- Reference `config.js` uses remote Unsplash avatars. Their individual asset licenses were not verified, so none are used. Property art and guest monograms here are CSS-generated.
- Reference loads Plus Jakarta Sans from Google Fonts. This implementation uses Forma `--font-family-sans` and existing project font setup.

## Observed reference system

- **Shell:** pale sky background with subtle wave lines, thick teal rounded outer frame, teal vertical navigation, white rounded scrolling workspace, fixed search/profile/notification header. Desktop screenshot is centered and compact; source CSS changes sidebar/workspace arrangement below 1024px.
- **Color:** teal primary `#29a399`, navy text `#1e2538`, sky `#dff3fc`, pale cyan `#bcebf7` / `#dcf5fb`, lemon yellow `#fae06c`, and soft pink surfaces. Active nav is a white pill with a teal icon; earned bars are cyan and selected/today bar yellow.
- **Typography:** Plus Jakarta Sans, bold compact page headings, medium-weight navigation, muted secondary copy, pill badges. Source uses several labels below Forma's minimum; implementation normalizes visible UI to shared tokens (14px body, 12px minimum) instead of reproducing undersized text.
- **Motion:** reference source implements an animated active-nav pill, staggered page entrance, spring-like chart bar growth, hover lifts, notification bell, and gently moving decorative cat/moon/palm art. Implementation keeps restrained page/bar/card transitions and honors reduced motion; no copied illustration.
- **Evidence boundary:** provided screenshot shows Bookings only. The source HTML/JS additionally documents Home, Rate plans, Apartments, Pricing, and Support views/interactions. The implementation follows those source-described flows but does not claim the unseen views are pixel-matched.

## Pages and interactions

1. **Bookings:** 14-day earnings chart, three period datasets, selectable daily bars, Today/Earned filters, booking status tabs, show-all, search, status/quick actions, downloadable local CSV, arrival/payout cards, custom promotion and reservation dialogs.
2. **Home:** revenue/occupancy/check-in/rating summaries, filterable housekeeping queue with cycling status, revenue channel share, sample key sync, guest message actions, and device-status cards.
3. **Rate plans:** sample plan cards with accessible switches, custom create-plan dialog, seven-day property rate matrix with a reversible 15% surge, and extra-fee summaries.
4. **Apartments:** eight CSS-illustrated property cards, All/Occupied/Available filters, working status toggles, occupancy, ratings, nightly rates, and a route to pricing simulation.
5. **Pricing:** working auto-pilot switch, base/surge/discount range inputs, derived occupancy/revenue forecast chart, local rule switches, and illustrative market comparison.
6. **Support:** searchable accordion FAQs, custom local maintenance feedback, simulated concierge chat with quick prompts, and accessible guide-summary dialogs.

All host, booking, payout, device, and market figures are labeled sample/demo data. State stays in React memory and resets on reload; no API, payments, real booking, notification delivery, support agent, IoT, or persistence is implied. Every shown action has local behavior or explicitly explains its mock status.

## Forma implementation and responsive behavior

- Shared UI: Forma `Button`, `Card`, `Badge`, `Input`, `Label`, `Select`, `Switch`, `Tabs`, `DropdownMenu`, `Dialog`, and `Toast`; no native blocking dialogs.
- Semantic accent uses registry variants `Lagoon` and `Coral`. Reference-inspired teal/cyan/yellow/pink palette stays scoped to this template; no shared design-system files changed.
- Typography uses `--font-size-page`, `--font-size-card`, `--font-size-body`, `--font-size-helper`, and line-height/weight tokens. Body default is 14px; visible text minimum 12px.
- Desktop uses a left sidebar with the white workspace scroll surface. Tablet/mobile move navigation into a compact expandable menu, wrap content into one/two columns, keep matrix cells legible, and avoid page-level horizontal overflow. Browser checks cover 375px, 820px, and 1366px.
- Previews are generated from the running React/Vite entry with Playwright at 1366px desktop and 375px mobile. This is not a pixel-perfect claim.

## Compatibility

React + Vite was tested through registry integration, production build, unit tests, and Playwright browser checks. No Next.js compatibility is claimed.
