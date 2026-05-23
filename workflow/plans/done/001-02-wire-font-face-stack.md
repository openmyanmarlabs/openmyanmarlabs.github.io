# 001-02 — Wire @font-face + Myanmar font stack, verify

Plan: `001-root-khithaungg-myanmar-font.md` · Blocked by: 01 · Parallel-safe with: —

## Goal

Register KhitHaungg via `@font-face` (4 weights) and make it lead the Myanmar font stack so Burmese text in `landing` renders in KhitHaungg, with Noto Sans Myanmar as fallback.

## Context

- woff2 assets (from phase 01) live at `/fonts/khithaungg-{400,500,600,700}.woff2`.
- **Font var**: `landing/src/styles/tokens.css` line ~71:
  `--font-myanmar: "Noto Sans Myanmar", sans-serif;`
- **Burmese rules** already in `landing/src/styles/global.css` consume `var(--font-myanmar)` via `:lang(my)`, `[lang="my"]`, `.font-myanmar`, plus `[lang="my"] h1/h2/h3`. No selector changes needed — updating the var cascades to body + headings.
- `<html lang>` is synced by `landing/src/i18n.tsx` on toggle (locales `my` default / `en`); CSS reacts automatically.
- Noto Sans Myanmar still loads from Google CDN (`index.html`) — keep it; it's the fallback.
- Vanilla CSS, no Tailwind. Put `@font-face` blocks at the top of `global.css` (where Burmese font rules already live) — no new import wiring.
- Resolved: ship discrete static weights (no variable font); `font-style: normal`; `font-display: swap`.

## Steps

- [ ] Add 4 `@font-face` blocks in `global.css`, family `"KhitHaungg"`, one per weight 400/500/600/700, each `src: url("/fonts/khithaungg-NNN.woff2") format("woff2"); font-style: normal; font-display: swap;`.
- [ ] Update `--font-myanmar` in `tokens.css` so KhitHaungg leads:
      `--font-myanmar: "KhitHaungg", "Noto Sans Myanmar", sans-serif;`
- [ ] Run the landing dev server; toggle to Burmese.
- [ ] Verify in browser DevTools (see Done when).

## Done when

- In Burmese mode, body + h1–h3 Burmese copy render in KhitHaungg.
- DevTools Network shows `khithaungg-*.woff2` loaded from `/fonts/` (not Google CDN) for Burmese text.
- Bold Burmese text (`<strong>`, 600 headings) uses real KhitHaungg 600/700 — no faux-bold.
- English mode unchanged (Fraunces display + system sans); no KhitHaungg requested.
- A glyph absent from KhitHaungg (if any) falls back to Noto Sans Myanmar, not tofu.

## Touches

- `landing/src/styles/global.css` — add 4 `@font-face` blocks.
- `landing/src/styles/tokens.css` — update `--font-myanmar` stack.
