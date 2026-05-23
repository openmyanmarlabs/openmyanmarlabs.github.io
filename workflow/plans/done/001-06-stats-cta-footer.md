# 001-06 — Stats + Get-notified CTA + Footer

Plan: `001-root-brand-landing.md` · Blocked by: 02, 03 · Parallel-safe with: 04, 05

## Goal

Build the bottom of the page — dark credibility stats strip (animated count-ups), the visual-only Get-notified waitlist CTA, and the footer.

## Context

- Blocked by 02 (Stat tile, Count-up, Button, reveal) + 03 (stats/CTA/footer copy). Parallel-safe with 04 + 05 (disjoint section files).
- `landing/CLAUDE.md`: kebab-case, export PascalCase, `.jsx`. UI per `design-system/design-system-reference.md`.
- **Stats** = dark credibility strip (ink bg `#0f1216`, text on dark), 4 stats, big tabular numerals, Count-up: 2+ yrs paying customers · 25k+ owners · 1 → 6 apps live and on the way · 100% offline-first. Values/labels from content.js. Count-up honors reduced-motion (snap to final).
- **CTA** = the **single conversion goal**: "Get notified" waitlist. **Visual-only** — no backend/auth/email capture. Email input + submit → local success state (or no-op); make no-backend nature clear in code. On accent band gradient `155deg #0a84ff → #0071e3 → #0a5bbf`. This is the scroll target for nav "Get notified" — give it an **anchor id matching phase 04's link**.
- **Footer** = brand + tagline + link columns (Apps / Company). Labels from content.js.
- Rhythm tail (design system): … → ink (stats) → accent band (CTA) → footer.
- All copy via i18n/content.js; reveal wrapper; honor reduced-motion. Burmese in Noto Sans Myanmar.

## Steps

- [ ] `stats-section.jsx` — dark strip; 4 Stat tiles using Count-up; values/labels from content.
- [ ] `cta-section.jsx` — accent-band Get-notified waitlist; email input + submit; local success, no backend; anchor id for nav scroll-to.
- [ ] `footer.jsx` — brand, tagline, Apps/Company link columns from content.
- [ ] Wrap sections in scroll-reveal (staggered, once, reduced-motion safe).
- [ ] Responsive: stats grid + footer columns collapse on mobile.

## Done when

- Stats strip dark with 4 animated count-ups (snap under reduced-motion), values from content.
- CTA on accent band; submit shows visual success with no network call; has anchor id nav targets.
- Footer renders brand + tagline + link columns, bilingual.
- All three swap language on toggle.

## Touches

- `landing/src/sections/stats-section.jsx` — dark credibility strip.
- `landing/src/sections/cta-section.jsx` — visual-only waitlist.
- `landing/src/sections/footer.jsx` — footer.
- (consumes shared-ui Stat tile/Count-up/Button/reveal + content.js + i18n)
