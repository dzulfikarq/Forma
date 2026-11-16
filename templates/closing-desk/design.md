# Closing Desk

## Reference analysis

- Source: user-supplied 22-second MP4, 960 × 720, H.264 at 30 fps. Representative frames sampled throughout; dashboard appears first, followed by inbox and a seller-credit review. The source author, original product, and asset license were not identified.
- Observed visual system: pale gray outer canvas; white, softly rounded workspace; thin neutral borders; dark charcoal text; restrained orange accent for brand, attention, and primary actions. Compact pill navigation spans the top. Sans-serif typography, moderate weights, small labels, and consistent spacing. No external logo, photo, illustration, or font was reusable or copied.
- Dashboard: four summary metrics (active deals, upcoming closings, items needing the coordinator, overnight agent actions); a closing timeline; alerts; agent activity; and a deadline calendar. Cards are lightly outlined with subtle elevation.
- Inbox: title and outstanding-item summary; filters for All, Approvals, Conflicts, Quiet parties, and Unclear reads; a compact issue list beside a detail pane. The selected issue compares two document excerpts ($8,500 vs. $8,000), names affected closing documents, shows intake/preflight activity, and offers a message draft to Sophia.
- Interaction evidence: select inbox filters and issue; compare/select either amount; edit or send a question; sending moves the count from six to five and exposes Undo. Dashboard deadline days are selectable. Search, Activity, and account controls are represented as clearly labeled local sample interactions; no exact source behavior is inferred for those controls. Brief skeleton/transition states appear between views; exact timing is unknown.
- Responsive evidence: supplied video shows a 960 × 720 desktop-like viewport only. Tablet/mobile behavior is therefore an implementation assumption: navigation collapses behind an accessible menu, KPI and support grids reflow, and inbox panes stack with a bounded issue list.
- Unknowns: source brand and license; unseen routes (Deals, Calendar, Contacts, Agents, Reports); persistence, network behavior, authorization, and all data outside the shown states. Those routes and backend behavior are intentionally not represented.
- License/attribution: original implementation and fictional sample data. No source code, screenshots, product name, logo, or third-party imagery copied. Source-video license is unknown; video is analysis-only and is not redistributed. Shared Plus Jakarta Sans retains its workspace SIL Open Font License attribution.

## Implementation notes

- Shared Forma UI controls and semantic design tokens; Ember is the default accent, Pine is the alternate. Light and dark theme tokens remain supported.
- Dashboard and Inbox are the only implemented views. Search, filters, alert review, amount selection, message send/undo, Activity/account dialogs, and calendar-day selection are local interactions. Sample data resets on reload; no message, decision, or deadline is persisted or transmitted.
- Playwright desktop/mobile previews capture light theme to match reference; dark theme remains supported in live showcase.
- Small motion is limited to view entrance and feedback; reduced-motion preferences are respected by workspace tokens.
- Deviations: branded copy is replaced with “Closing Desk”; all people, companies, dates, and transactions are fictional. Responsive behavior is designed and browser-tested because source video provides no mobile evidence.
