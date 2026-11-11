# Focus Planner

## Reference analysis

- Source: no image, video, design file, website, or repository reference was supplied. This is an original workflow sample, not a reconstruction.
- License review: original React/CSS implementation; no external assets or copied code.

## Structure and visual system

- Compact daily-planning dashboard: brand/header, short date-led introduction, three progress summaries, and a task list.
- Plus Jakarta Sans with system fallback. Body text uses `--font-size-body` (14px); helper text uses `--font-size-helper` (12px). All visible UI text stays at or above 12px.
- Shared semantic surface, foreground, muted, border, and accent tokens drive light/dark and Coral/Moss variants.
- Shared `Button`, `Card`, `Checkbox`, `Tabs`, and Radix-backed `Dialog` components provide consistent interaction and focus behavior.

## Interactions

- Add task opens an accessible custom dialog; required title is added to local React state.
- All / To do / Done tabs filter task list. Checkbox updates completion and progress counts.
- Tasks and summary metrics are clearly sample/local data; state resets on reload. No API or persistence is implied.

## Responsive assumptions

- Desktop and tablet keep summaries in three columns while the content remains readable.
- Narrow layouts stack summary cards and reduce page padding; task titles wrap instead of shrinking.
- Showcase device previews exercise the real component at 1366px, 820px, and 375px. Playwright-generated desktop/mobile images capture the running implementation.

## Compatibility and known deviations

- React + Vite is tested in the registry-backed showcase build and Playwright interaction/responsive checks.
- Next.js compatibility is not claimed; no Next.js integration test exists.
- Date and starter task content are fixed sample data, not live calendar state.
