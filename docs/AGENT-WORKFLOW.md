# Coding-agent template workflow

Use when user supplies screenshot/image, video, design.md, GitHub repository, or website.

1. Analyze all provided references. For video, sample representative frames; note dimensions, page changes, motion, typography, spacing, interaction evidence, and anything not visible. Don’t infer invisible behavior.
2. Identify category/template type. Reuse stable category ID or define a new category in template metadata.
3. Inspect external code/assets, their license, and attribution before reuse. Prefer original implementation. Never copy proprietary UI/assets without permission.
4. Write `templates/<id>/design.md`: source, observed structure, visual tokens, interactions, responsive assumptions, and known deviations. Do not call a result pixel-perfect unless measured and verified.
5. Define stable metadata, design tokens, variants, React compatibility claims, dependency list, license attribution, preview source, and tests.
6. Implement React entry using shared components/tokens. Add accessible loading/error/empty states where relevant. Keep mock data labeled and all visible controls functional; no native browser prompts.
7. Update source metadata only. Run `pnpm registry:build`; inspect generated registry and preview copy.
8. Validate at desktop/tablet/mobile widths; test keyboard paths, dialog focus/Escape/cancel, light/dark, accent variants, reduced motion, and key user flows.
9. Run `pnpm registry:check`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and Playwright when available. Report actual outputs and gaps.
10. Release only after checks pass. Build registry with immutable semver tag or full commit SHA; do not publish a branch pointer.

Do not build an AI image/video-to-code service in V1. Reference analysis is coding-agent development work.
