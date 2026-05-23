# 001-04 — Nav + Hero

Plan: `001-root-brand-landing.md` · Blocked by: 02, 03 · Parallel-safe with: 05, 06

## Goal

Build the top of the page — sticky translucent nav with language toggle + "Get notified", and a hero with brand statement + floating cluster of app-icon tiles.

## Context

- Blocked by 02 (Button, Card, reveal) + 03 (copy in content.js). Parallel-safe with 05 + 06 (disjoint section files).
- `landing/CLAUDE.md`: kebab-case, export PascalCase, `.jsx`. UI per `design-system/design-system-reference.md`.
- **Nav**: sticky, translucent (blur/backdrop); logo (`design-system/openmyanmarlabs-icon.svg`) + section anchor links (Apps/Approach/…) + EN/မြန်မာ toggle (drives i18n context) + "Get notified" primary pill (scrolls to CTA).
- **Hero**: brand statement (display serif, fluid 44→92px) + sub; a **floating cluster of app-icon tiles** with Daily Sales lit as Live, others muted. Soft float elevation; calm entrance via reveal; reduced-motion safe.
- All text from content.js via i18n — no hardcoded copy. Myanmar-first default.
- Hero on white surface (rhythm starts white); nav translucent over it; global radial wash + grain shows through.

## Steps

- [ ] `nav.jsx` — sticky translucent bar; logo, section links, EN/မြန်မာ toggle wired to i18n, "Get notified" primary button.
- [ ] Toggle flips i18n lang; nav copy from content.js.
- [ ] Section links smooth-scroll to anchor ids (apps/approach/stats/cta).
- [ ] `hero-section.jsx` — display headline + sub from content; primary CTA.
- [ ] Floating app-icon tile cluster — Daily Sales lit/Live, others muted; float elevation + entrance reveal; reduced-motion safe.
- [ ] Responsive: nav collapses on mobile; hero cluster reflows.

## Done when

- Sticky translucent nav with working language toggle; "Get notified" scrolls to CTA.
- Section links scroll to targets.
- Hero shows bilingual brand statement + floating app-tile cluster (Daily Sales as Live).
- Copy swaps on toggle; animations respect reduced-motion.

## Touches

- `landing/src/sections/nav.jsx` — sticky translucent nav.
- `landing/src/sections/hero-section.jsx` — hero + floating tile cluster.
- (consumes shared-ui + content.js + i18n)
