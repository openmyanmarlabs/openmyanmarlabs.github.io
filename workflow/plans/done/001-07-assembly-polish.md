# 001-07 — Assembly + polish

Plan: `001-root-brand-landing.md` · Blocked by: 04, 05, 06 · Parallel-safe with: —

## Goal

Compose all sections into the single-scroll page in order, orchestrate reveals, finish responsive + a11y + bilingual polish, and confirm a clean production build.

## Context

- Blocked by 04, 05, 06 (all sections must exist). Final phase.
- Page order (single scroll): Nav → Hero → Apps → Approach → Stats → Get-notified CTA → Footer.
- `landing/CLAUDE.md`: kebab-case, export PascalCase, `.jsx`.
- Rhythm (design system): white → panel → white → ink → accent band → ink/footer. Verify bands actually alternate; fix two-adjacent-same-bg.
- Motion: **one orchestrated reveal beats many micro-moves** — staggered scroll reveals cohesive across sections, not chaotic. 150/250/400ms, ease reveal `cubic-bezier(.22,1,.36,1)`.
- A11y: honor reduced-motion globally (count-ups/reveals inert); keyboard-navigable nav + toggle; contrast on dark + accent bands; alt text on logo/icons.
- Bilingual: Myanmar-first default; verify **every** visible string toggles EN↔my and Burmese renders in Noto Sans Myanmar everywhere (incl. dark/accent bands). Confirm en/my key parity.
- Nav "Get notified" + section links scroll to right anchor ids.
- Daily Sales "Open app →" → its landing (placeholder href ok if real URL missing — flag it).
- Pitch-demo scope: waitlist stays visual-only; no backend added here.

## Steps

- [ ] Compose `src/app.jsx` (or root) rendering sections in page order inside i18n provider.
- [ ] Assign/verify section anchor ids; wire nav links + "Get notified".
- [ ] Verify bg bands alternate per rhythm; fix collisions.
- [ ] Tune cross-section scroll-reveal orchestration (stagger, once).
- [ ] Full reduced-motion pass (reveals + count-ups inert).
- [ ] Responsive pass mobile→desktop for every section (nav, hero cluster, apps grid, stats, footer columns).
- [ ] Bilingual QA: toggle EN↔my, all strings swap + Burmese renders everywhere; confirm key parity.
- [ ] A11y pass: keyboard nav, focus states, contrast, alt text.
- [ ] Run production build (`bun run build`); fix errors/warnings; confirm it ships.

## Done when

- All seven sections render in order on one scrolling page within the i18n provider.
- Nav links + "Get notified" scroll to correct sections.
- bg bands alternate per rhythm; reveals cohesive; reduced-motion fully respected.
- Responsive mobile→desktop and fully bilingual (Myanmar-first, all strings toggle, Burmese renders).
- Production build completes clean.

## Touches

- `landing/src/app.jsx` (or root) — section composition + provider.
- `landing/src/sections/*` — minor anchor/rhythm/responsive fixes.
- `landing/src/<global stylesheet>` — final responsive/atmosphere tweaks.
