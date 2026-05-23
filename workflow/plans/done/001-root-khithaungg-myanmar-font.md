# Plan 001 — KhitHaungg Myanmar Font (landing)

Source: `workflow/specs/2026-05-23-khithaungg-myanmar-font.md`

## Summary

Self-host KhitHaungg as the primary Burmese typeface in the `landing` app. Convert 4 source `.otf` weights → `woff2`, vendor them into `landing/public/fonts/`, then `@font-face` them and make KhitHaungg lead the `--font-myanmar` stack (Noto Sans Myanmar kept as fallback). Activation is free — rides the existing `[lang="my"]`/`:lang(my)` rules driven by `src/i18n.tsx`. Inherently sequential: assets first, then wiring + verify.

## Phases

| #   | Phase                           | File                                        | Blocked by | Parallel-safe with |
| --- | ------------------------------- | ------------------------------------------- | ---------- | ------------------ |
| 01  | Convert & vendor woff2 fonts    | `plans/todo/001-01-vendor-woff2-fonts.md`   | —          | —                  |
| 02  | Wire @font-face + stack, verify | `plans/todo/001-02-wire-font-face-stack.md` | 01         | —                  |

## Notes / risks

- **No woff2 tooling on PATH.** Phase 01 must install/run a converter. `fonttools` (Python + `brotli`) reliably handles OTF→woff2; npm `ttf2woff2` via `bunx` also accepts OTF despite the name. Phase 01 documents whichever command is used.
- **OTF (CFF) outlines** — woff2 is just a container, carries CFF fine; no glyph loss expected.
- **Resolved spec open questions:** asset naming = weight-numbered (`khithaungg-400.woff2` … `-700.woff2`); `@font-face` blocks go in `landing/src/styles/global.css` (where Burmese font rules already live) — no new import wiring.
- **Verification needs the dev server** + a real browser toggle to Burmese; confirm fonts load from `/fonts/`, real Bold (700) not faux-bold, English untouched.
- Nothing executed yet — phases sit in `plans/todo/`; move to `plans/done/` as they ship.
