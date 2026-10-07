
# DESIGN LOCK - 2026-10-06 (wave 4)
**Status:** COMPLETE (files only, not committed). 2026-10-06: CTA above fold at 1280, Feedback moved left (no FAB overlap), defaults preselected, build + tsc green. 375px: CTA at fold edge, acceptable.
- Archetype: `weekend-lifestyle` (pickArchetype avoid-list honoured; distinct from the other 3 in this batch)
- Accent `#e11d74` on bg `#fff5f8`; blush bg, hot-pink accent (no purple). check-palettes: free (run 2026-10-06)
- Animated bg: `mesh` via design-system AnimatedBg, honours prefers-reduced-motion
- Logo: Play<accent>Smart</accent> play-triangle-in-spark mark; app/icon.svg + apple icon + Logo component (icon.tsx shadowing renamed to .bak where present)
- Theme: lib/theme-loader.ts (loadSiteTheme + buildThemeStyleTag + buildGa4Snippet); GA4 off unless hub sets a valid id. Edge Config import is require-guarded where the package is not installed
- Telemetry: consent-gated usage log + structured error log -> /api/log (stdout JSON lines, no PII, no new deps)
- Content: Lifestyle/weekend look; drills generator is the live demo.
- Files-only run: no git, no deps added. Build + 375/1280 screenshots below.

## Status
COMPLETE (design-lock applied, build run). Files changed: layout, globals, logo/icons, theme-loader, Telemetry, AnimatedBg, api/log, chat route. Not committed.

## Hub retrofit (2026-10-06)
- theme-loader uses fetch REST shim over EDGE_CONFIG (no new deps), cached 600s; data-layout on <html>; hub palette sets --bg/--accent. Build passes. Not visually verified (no screenshots).


## OWASP LLM Top 10 dispositions (gate item 45, 2026-10-07; list recalled from memory, unverified)
- LLM01 prompt injection: input sanitised in chat route (app/api/chat/route.ts); no output filtering or tool sandbox review done. PARTIAL.
- LLM02 sensitive info disclosure: `redact()` helper available; not applied to every log. PARTIAL.
- LLM04/10 DoS / unbounded consumption: per-IP rate limit where present; token budgets not enforced. PARTIAL.
- LLM05 improper output handling: model output rendered as text; not audited for HTML sinks. UNVERIFIED.
- LLM06 excessive agency: no tool-calling agents audited. UNVERIFIED.
- Others (supply chain, poisoning, embeddings, misinformation): not assessed.
