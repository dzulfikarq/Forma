# Relay Workflow Studio

## Reference analysis

### Sources and evidence
- User-supplied video: `threadsdownloader.com_18200c.mp4`, 1280 × 720, 25 fps, 11.8 seconds. Twelve representative frames sampled at one-second intervals.
- Live demo: [demo.accordee.app](https://demo.accordee.app).
- Public screen/module references: [workflow list](https://www.accordee.app/library/screens/workflows), [workflow builder](https://www.accordee.app/library/screens/workflow-builder), [new workflow](https://www.accordee.app/library/screens/new-workflow), and [workflow canvas](https://www.accordee.app/library/modules/workflow-canvas).
- License reviewed: [Accordee license](https://www.accordee.app/license). It restricts redistributing Accordee source/design items as templates or UI kits. This implementation uses those sources only to analyze product patterns; it does not copy their source, logo, wording, screenshot, or other design assets.

### Observed in the supplied video
- Desktop automation workspace with persistent dark left navigation and a lighter main area; compact top bar, workflow canvas, and a right-side inspector/recent-run area.
- Workflow consists of connected trigger/schedule, condition/rule, instruction, and app/action steps. Node cards use rounded surfaces, subtle borders/shadows, small colored type icons, and connecting lines.
- Neutral gray/white surfaces contrast with dark plum/navy navigation and muted purple/blue accents. Green denotes a successful/active state; status indicators update while the clip plays.
- Typography is a compact modern sans. Exact font, font sizes, spacing tokens, and color values are not exposed by the video.
- Visible controls include workflow enable/run actions, canvas tools, a theme control, and node/app controls. The clip shows run/node state changes; it does not establish actual backend behavior.

### Observed in public demo/docs
- Workflow list includes search/filtering and workflow records; supporting views cover run history and connected apps.
- Builder supports a node canvas, inspector, adding conditions/actions, organizing the canvas, zoom/pan controls, workflow enable/disable, and manual run.
- New-workflow material presents starting from scratch, prompt, or template. Prompt generation is not implemented here.
- Public references document interactions and product structure, not this template's implementation behavior.

## Design decisions
- **Category:** `project-management`; fits team workflow authoring and monitoring. Existing registry category, so no category catalog changes.
- **Layout:** persistent workspace navigation, searchable workflow list with status filter and summary cards, focused canvas editor with inspector, run-history table, and connection cards.
- **Typography:** Forma Plus Jakarta Sans and semantic typography tokens. Body stays at 14px; visible labels/helper text stay at least 12px.
- **Color and surfaces:** semantic light/dark Forma surfaces; original indigo and teal variants, calm neutral canvas, dark plum navigation, and distinct semantic state colors.
- **Motion:** short CSS hover/transition feedback; respects the shared reduced-motion rules. Workflow status changes are announced through shared Toast feedback.
- **Responsive behavior:** only desktop reference evidence exists. At tablet/mobile, navigation moves to shared responsive navigation, inspector stacks under the canvas, cards and controls wrap, and tabular data scrolls within its own container. This responsive layout is an implementation decision, not an observed Accordee breakpoint.
- **Interactions:** workflow search/status filter, create draft dialog, node selection and inspector edits, add condition/action/delay, zoom/fit/tidy canvas controls, enable/pause, run sample, run history navigation, connection toggles, and light/dark switch. All state is local and resets on reload; no connected service is called.
- **Unknowns:** original source breakpoints, exact typography/color tokens, keyboard canvas behavior, and live service semantics cannot be established from supplied evidence.

## License and attribution
- Original Forma React/CSS implementation under MIT. Shared Forma UI and Lucide icons remain their separately licensed dependencies.
- No Accordee source code, brand, screenshots, or visual assets are included. Fictional workflow/app names and sample records are original.

## Deviations
- Uses Relay branding, fictional workspace/apps, fresh copy, Forma semantic tokens, and an original canvas/inspector arrangement. No claim of pixel-perfect reproduction or Accordee compatibility.
