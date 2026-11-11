# Framework compatibility

Portable compatibility is per template and based on an independent export/install, dependency install, typecheck, production build, and browser smoke test. The registry's prior showcase-only `tested` flags are not enough for portable installation; metadata is `untested` until this evidence exists.

| Template | React + Vite | Next.js App Router | Evidence |
| --- | --- | --- | --- |
| Modern Admin 1.0.0 | Tested — React 19.3.1, Vite 7.3.8 | Tested — React 19.3.1, Next.js 16.4.6 | Independent clean targets; typecheck/build/browser smoke pass; see `docs/TESTING.md` |
| Focus Planner 0.1.0 | Tested — React 19.3.1, Vite 7.3.8 | Untested | Independent clean target; typecheck/build/browser smoke pass |
| Staywise Host Dashboard 0.1.0 | Tested — React 19.3.1, Vite 7.3.8 | Tested — React 19.3.1, Next.js 16.4.6 | Clean export/install targets; dependency install, typecheck, production build, browser smoke; Coral theme; see `docs/TESTING.md` |

## Adapter contract

- `react-vite`: Vite 7, React 19, generated root `src/main.tsx`, shared theme provider, bundled CSS imports, Tailwind 3 config.
- `next-app-router`: Next 16 App Router, React 19; generated `app/layout.tsx` remains server component and `app/page.tsx` declares client boundary for stateful template. CSS enters via App Router global stylesheet; template/shared source is unchanged.
- Plus Jakarta Sans loads from Google Fonts at runtime, with system fallback. This requires network access for the named font.
- Themes map the selected registry variant's accent token into the same shared `ThemeProvider`. Navigation, dialogs, and responsive template behavior are unchanged.
- Framework adapter versions currently have semver ranges in generated `package.json`; run a fresh dependency install and build before release. Package payload hashes do not pin npm dependency resolution.

Next.js is not claimed for other templates until their own evidence is added here and their metadata compatibility status is updated.
