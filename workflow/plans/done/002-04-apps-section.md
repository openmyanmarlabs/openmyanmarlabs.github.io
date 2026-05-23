# 002-04 — Apps section

Plan: `002-root-decorate-ui.md` · Blocked by: 01 · Parallel-safe with: 02,03,05,06,07,08

## Goal

Redecorate the apps showcase grid with hover micro-interactions + refined featured-card treatment. Asset-light.

## Context

- **File:** `src/sections/apps-section.tsx` — panel band (`--color-panel`), `id="apps"`. Header (title + subtitle) + `auto-fit` card grid (`minmax(280px,1fr)`). Daily Sales is **featured**: full-width card (`gridColumn: 1/-1`), accent border, "Open app →" `Button`. Others = `Badge` (live→free/green, soon→soon/gray). `Reveal stagger`.
- **Copy frozen:** `t.apps.*` (title, subtitle, openApp, badge, items[{name,status,tagline,href?,featured?}]). `name` stays English both langs.
- **Showcase, not product page** — no per-app feature depth (keep it that way).
- Card opt-in hover-lift from Phase 01 is available. Build with **`frontend-design` skill**. CSS/SVG/gradient only.

## Steps

- [ ] Use the `frontend-design` skill.
- [ ] Recompose grid/cards for polish; give the featured Daily Sales card a stronger (still calm) spotlight/gradient treatment.
- [ ] Apply Card hover-lift to the app cards; refine `Badge` + status presentation (subtle micro-animation OK).
- [ ] Refine the staggered reveal; keep `auto-fit` responsiveness.
- [ ] Gate animations on reduced-motion; verify EN + MY.

## Done when

- Apps grid visibly upgraded; featured card reads as the hero of the section; hover micro-interactions tasteful + reduced-motion-safe.
- Both langs + responsive grid intact.
- `bun run typecheck` + `bun run build` pass.

## Touches

- `landing/src/sections/apps-section.tsx` — redesign (+ optional co-located local helper; NO `shared-ui`/token edits).
