# ADR-0003: token CSS and local Radix UI

- **Status:** Accepted
- **Context:** Templates need consistent accessible components with custom accents and light/dark themes, while avoiding per-template duplication.
- **Decision:** Keep local shadcn-style components in `packages/ui`, use Radix primitives for behavior, Tailwind for utilities, CSS variables for semantic tokens, and Motion for restrained motion.
- **Alternatives:** Import shadcn CLI output independently per template; use a large component framework; implement all primitives from scratch.
- **Reasons:** Shared ownership and token consistency, accessible interaction primitives, compact V1 dependencies.
- **Tradeoffs:** Local component wrappers need maintenance and accessibility tests. shadcn/ui is a composition approach, not a separate runtime dependency.
