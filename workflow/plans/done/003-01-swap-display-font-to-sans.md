# 003-01 — Swap display font to sans (CSS + HTML)

Plan: `003-root-english-heading-sans-font.md` · Blocked by: — · Parallel-safe with: 02

## Goal

English headings render in the Apple system sans stack instead of serif Fraunces; Fraunces no longer loads.

## Context

The English display font is defined once and consumed everywhere via the `--font-display` token:

- `landing/src/styles/tokens.css:89` — `--font-display: "Fraunces", Georgia, "Times New Roman", serif;` (the serif; falls back to Times New Roman when Fraunces is slow/blocked — the bug).
- `landing/src/styles/tokens.css:91-93` — `--font-sans:` already holds the Apple system stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, …`). This is the target value.
- `--font-display` is read by global `h1–h6` (`global.css:106`) and 8 inline `fontFamily: "var(--font-display)"` spots (hero/apps/approach/stats/cta/footer/stat-tile). **Keep the token name** so none of those need editing.
- `landing/index.html:8-14` — Google Fonts `<link>` requests both `Fraunces` (with italic axes) and `Noto Sans Myanmar`. Italic Fraunces is loaded but used nowhere.

Decisions locked (from spec): reuse `--font-sans` value; change all English headings; remove Fraunces entirely. Do NOT touch Burmese heading rules (`global.css:111-126`).

## Steps

- [ ] In `tokens.css`, set `--font-display` to the Apple sans stack — prefer DRY: `--font-display: var(--font-sans);`. Remove the serif fallbacks (`Georgia`, `"Times New Roman"`, `serif`) entirely.
- [ ] Update the `--font-display` inline comment / `Typography: families` block in `tokens.css` to say sans (no longer serif).
- [ ] In `global.css:99`, fix the heading comment `/* --- Headings: display serif … --- */` → sans.
- [ ] In `index.html`, edit the Google Fonts `<link href>` to drop the `Fraunces:ital,opsz,wght@...&` segment; **keep** the `Noto+Sans+Myanmar:wght@...&display=swap` part. Update the `<!-- Fonts: Fraunces (display serif, italic=emphasis) … -->` comment (line 8) to drop the Fraunces/italic mention.

## Done when

- All English headings render sans-serif — hero h1, every section h2, app titles, stat tiles, footer title.
- With network throttled / Google Fonts blocked, headings stay sans (no Times New Roman).
- DevTools Network shows no Fraunces request; Noto Sans Myanmar still loads.
- Burmese headings still render KhitHaungg / Noto Sans Myanmar (no regression).

## Touches

- `landing/src/styles/tokens.css` — repoint `--font-display`, drop serif fallbacks, fix comment.
- `landing/src/styles/global.css` — fix the `display serif` heading comment (line 99).
- `landing/index.html` — remove Fraunces from the Google Fonts link; update the fonts comment.
