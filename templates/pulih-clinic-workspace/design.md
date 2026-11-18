# Pulih Clinic Workspace

## Reference analysis

- **Source:** three clinic-software screenshots attached in the request. No source site, code, downloadable assets, or license notice was supplied; screenshot pixel dimensions are not available in the repository.
- **Observed pages:** patient consultation chart and daily clinic dashboard/schedule. Patient chart shows demographics and medical record ID, conditions and allergy, current vitals, HbA1c trend, lab values, medications, and SOAP note. Dashboard shows daily clinic KPIs, appointments grouped by provider/room, and patient queue.
- **Layout:** persistent left navigation, slim utility/search header, spacious content surface, card-based work areas. Chart balances a compact patient summary column with wider clinical results and editable visit note. Schedule uses provider lanes against a time grid; queue sits beside it.
- **Typography:** restrained sans-serif UI; compact but legible labels, medium section titles, clear page heading and numeric emphasis. Implementation uses Forma Plus Jakarta Sans and shared typography tokens; visible text stays at least 12px.
- **Color and surfaces:** white/off-white panels, pale cool gray-green canvas, dark blue-gray text, thin neutral dividers, teal/green accent, and muted amber/violet status colors. Rounded cards and controls use restrained borders and shadows rather than strong gradients.
- **Components:** sidebar navigation, clinic selector, global patient search, appointment action, patient identity card, vital cards, trend chart, lab range bars, medication rows, SOAP text fields, provider schedule, queue, status badges, and custom dialogs.
- **Motion:** references do not establish meaningful animation behavior. Implementation uses brief shared-token transitions for hover, navigation, and dialogs; reduced-motion preference is respected by shared UI styles.
- **Interaction evidence and unknowns:** screenshots establish visible navigation and action affordances, but not their behavior, data persistence, mobile navigation, or exact responsive breakpoints. Those behaviors are assumptions, implemented as accessible local interactions and session-only sample data; no clinic API or real patient data is connected.
- **Responsive assumptions:** preserve desktop sidebar and split chart at wide viewports; collapse secondary columns and keep schedule horizontally scrollable on tablet; use Forma responsive navigation, stacked chart sections, wrapped actions, and two-column vital cards on mobile. Avoid shrinking UI text.
- **Assets and attribution:** original implementation, CSS chart, and fictional names/results. No screenshot assets, external code, icons, fonts, or illustrations copied. Icons use the repository's existing `lucide-react` dependency. Forma's shared Plus Jakarta Sans is distributed under SIL Open Font License 1.1, as documented by the design system.
- **Category:** `admin-cms` (`Admin & CMS`) from the existing registry; no new category needed.
- **Theme variants:** `teal` default and `lagoon` alternate use Forma accent tokens.
- **Deviations:** created additional local-only Patients, Lab results, Pharmacy, Billing & claims, and Reports views to make the visible navigation useful. All records are explicitly fictional; integrations and persistence are not implied.

## Validation coverage

- Unit tests cover default patient chart, patient search/navigation, appointment creation, walk-in check-in, and prescription creation.
- Preview generation captures desktop and mobile from the running implementation through `pnpm template:preview -- --id pulih-clinic-workspace`.
