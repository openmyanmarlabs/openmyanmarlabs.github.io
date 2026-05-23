# 001-01 — Scaffold, design tokens, i18n foundation

Plan: `001-root-brand-landing.md` · Blocked by: — · Parallel-safe with: —

## Goal

Stand up Vite + React 19 + `motion` in `landing/`, with design tokens, fonts, and the i18n context every later phase builds on.

## Context

- Net-new. `landing/` holds only `landing/CLAUDE.md`.
- Conventions (`landing/CLAUDE.md`): kebab-case all files/folders/assets; export PascalCase (`hero-section.jsx` → `HeroSection`); JSX files use `.jsx`.
- Tech (idea): Vite + React 19 + `motion` package. **No router, no state lib.** Language via small React context.
- Tokens from `design-system/design-system-reference.md`:
  - Light: Surface `#ffffff`, Panel `#f5f5f7`, Text `#1d1d1f`, Muted `#6e6e73`, Accent `#0071e3`, Accent hover `#0077ed`, Hairline `#d2d2d7`, Success `#34c759`, Danger `#ff3b30`.
  - Dark: ink `#0f1216` / deeper `#0b0e11`, text `#f5f5f7`, accent-on-dark `#5aa9ff`.
  - Gradients: brand `140deg #0071e3 → #34c759`; CTA band `155deg #0a84ff → #0071e3 → #0a5bbf`.
  - Spacing `4·8·12·16·24·32·48·64·96·128`. Radius sm8/md12/lg20/xl28/pill980. Elevation sm/md/float.
  - Motion: 150/250/400ms; ease standard `cubic-bezier(.4,0,.2,1)`, ease reveal `cubic-bezier(.22,1,.36,1)`. Honor reduced-motion.
- Fonts: Fraunces (display serif, italic=emphasis), Noto Sans Myanmar (Burmese), system sans (body). Tabular numerals. Steps: display 56/600, h1 32/600, h2 24/600, h3 20/600, body 17/400, small 15/400, caption 13/400. Fluid: hero 44→92px, section 30→50px, stat 40→72px. LH heading 1.2 / body 1.5.
- i18n: **Myanmar-first** — `my` is default on load; EN is the toggle. Context exposes lang + toggle + active content object. Copy in `src/content.js`, identical `en`/`my` keys; toggle swaps object. (Full copy = phase 03; here just context + minimal skeleton with both keys.)
- Brand logo asset exists: `design-system/openmyanmarlabs-icon.svg`.

## Steps

- [ ] Init Vite React (React 19) in `landing/`; add `motion`; verify React 19 + motion peer-deps.
- [ ] Add design tokens as CSS custom properties (colors, dark surfaces, gradients, spacing, radius, elevation, motion) in a global stylesheet.
- [ ] Wire fonts (Fraunces + Noto Sans Myanmar + system sans); tabular numerals; type scale + fluid heading clamps.
- [ ] Create `src/i18n.jsx` — context with `lang` defaulting to `my`, a toggle, active content accessor.
- [ ] Create `src/content.js` skeleton — `en` + `my` with identical placeholder keys.
- [ ] Base global styles: surface bg, text color, LH 1.2/1.5, root radial wash + faint grain.
- [ ] Confirm dev server runs; Burmese sample renders in Noto Sans Myanmar.

## Done when

- `landing/` dev server boots a blank-but-styled page (tokens + fonts applied).
- i18n context provides `my` by default, toggles to `en`.
- `src/content.js` exports `en`/`my` with matching keys.
- Burmese sample text renders correctly.

## Touches

- `landing/` — Vite scaffold (package.json, vite config, index.html, entry).
- `landing/src/i18n.jsx` — language context (default `my`).
- `landing/src/content.js` — en/my skeleton.
- `landing/src/<global stylesheet>` — tokens, fonts, base styles.
