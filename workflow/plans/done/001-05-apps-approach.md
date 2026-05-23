# 001-05 — Apps showcase + Approach

Plan: `001-root-brand-landing.md` · Blocked by: 02, 03 · Parallel-safe with: 04, 06

## Goal

Build the Apps showcase gallery (content-driven, Daily Sales featured) and the Approach section (four brand principles).

## Context

- Blocked by 02 (Card, Badge, reveal) + 03 (app list + principles copy). Parallel-safe with 04 + 06 (disjoint section files).
- `landing/CLAUDE.md`: kebab-case, export PascalCase, `.jsx`. UI per `design-system/design-system-reference.md`.
- **Apps** = showcase gallery, NOT product page — each card: name (English, both langs), one-line tagline (translated), status Badge (Live=free/green, Coming soon=soon/gray). **No per-app feature depth.**
- Six apps from content.js array (phase 03): Daily Sales (Live), Hotel Management, School Management, Mini ERP, Restaurant POS, Clinic & Pharmacy. **Map over the array — don't hardcode.**
- Daily Sales = **featured** + only Live: larger/highlighted card with "Open app →" link to its own landing (`href` from content, placeholder ok).
- **Approach** = 4 principles (title + blurb from content): Free to start; Offline-first; Meet you where you work; Earn trust, then grow. Clean grid/list with calm reveal.
- Section rhythm (design system): alternate white → panel. Apps + Approach adjacent → contrasting bg bands (one surface `#fff`, one panel `#f5f5f7`).
- All copy via i18n/content.js; reveal wrapper (staggered, once); honor reduced-motion. Cards use Card primitive.

## Steps

- [ ] `apps-section.jsx` — heading from content; map app list to cards.
- [ ] App card — name (English), tagline (translated), status Badge; Daily Sales featured with "Open app →" link (href from content).
- [ ] `approach-section.jsx` — heading + four principle items (title + blurb) in grid/list.
- [ ] Apply alternating bg bands (white / panel) for rhythm.
- [ ] Wrap both in scroll-reveal (staggered, once, reduced-motion safe).
- [ ] Responsive grid: multi-column desktop → single column mobile.

## Done when

- Apps gallery renders all six from content.js with correct status badges; Daily Sales featured + working "Open app →".
- Approach renders four principles bilingually.
- Both swap language on toggle and reveal on scroll (inert under reduced-motion).
- Section bg bands alternate per rhythm.

## Touches

- `landing/src/sections/apps-section.jsx` — showcase gallery.
- `landing/src/sections/approach-section.jsx` — four principles.
- (consumes shared-ui Card/Badge/reveal + content.js + i18n)
