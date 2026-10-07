# PlaySmart design

Source of truth: `design-system/` (MASTER.md, tokens, `components/AnimatedBg.tsx`). This file only records project choices.

- Accent: `#e11d74` (magenta on blush); palette checked with `design-system/scripts/check-palettes.mjs`.
- Hub override: Edge Config `theme_playsmart.design` (dials, brief, palette, `layout.bgAnimation`/`bgSpeed`) wins over these values; loaded by `lib/theme-loader.ts` and applied in `app/layout.tsx`.
- Background: `components/AnimatedBg.tsx` (hub-driven, reduced-motion safe).
- Logo: `components/Logo.tsx` (PlaySmart, accent on the second word), used in the navbar/header; favicon is `app/icon.svg` (same mark).
- ai-core: exempt: drill/video generation are single-shot prompts; no documents, RAG or memory. Chat uses the shared free-first chain.
