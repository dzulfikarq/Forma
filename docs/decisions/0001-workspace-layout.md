# ADR-0001: pnpm workspace and source-first template layout

- **Status:** Accepted
- **Context:** Templates must share UI/tokens, run in a local showcase, and remain adaptable to future React frameworks without claiming untested support.
- **Decision:** Use pnpm workspaces for showcase, shared packages, and template packages. Keep template React source and metadata in each template directory. Vite consumes entries through a glob.
- **Alternatives:** Separate repository per template; compile every template into a framework-neutral package; start with Next.js.
- **Reasons:** Local sharing, fewer release/repo operations, true live preview, minimal V1 tooling. Source entry avoids premature build abstraction.
- **Tradeoffs:** Vite glob is showcase-specific; cross-framework compatibility requires tested adapters. Workspace source imports constrain package publishing until export/build strategy is added.
