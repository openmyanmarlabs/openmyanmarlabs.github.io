# 002-08 — Footer

Plan: `002-root-decorate-ui.md` · Blocked by: 01 · Parallel-safe with: 02,03,04,05,06,07

## Goal

Redecorate the deeper-ink footer with quiet link hover micro-interactions + refined structure. Asset-light, restrained.

## Context

- **File:** `src/sections/footer.tsx` — **DEEPER INK band** (`--color-ink-deeper` #0b0e11), closes the page. Brand + tagline (left) · link columns Apps / Company (right, `auto-fit`) · top-hairline rights/copyright line with `new Date().getFullYear()`. `Reveal`. No anchor id.
- **Copy frozen:** `t.footer.{brand,tagline,rights,columns[{title,links[{label,href}]}]}`. Column link hrefs point at section anchors (`#apps`, `#approach`, `#cta`, `#daily-sales`).
- On-dark palette. Build with **`frontend-design` skill**. CSS/SVG only. Footer is the page's quiet close — keep motion subtle.

## Steps

- [ ] Use the `frontend-design` skill.
- [ ] Recompose layout/hairlines for polish; refine brand mark treatment.
- [ ] Add link hover micro-interaction (color / underline grow) on the column links; refine the reveal.
- [ ] Optional: a small back-to-top affordance (anchors to `#top`).
- [ ] Gate animations on reduced-motion; verify EN + MY; keep columns collapsing on narrow viewports.

## Done when

- Footer visibly upgraded but restrained; link hovers tasteful + reduced-motion-safe.
- Both langs + responsive collapse intact; year + anchors still work.
- `bun run typecheck` + `bun run build` pass.

## Touches

- `landing/src/sections/footer.tsx` — redesign (+ optional co-located local helper; NO `shared-ui`/token edits).
