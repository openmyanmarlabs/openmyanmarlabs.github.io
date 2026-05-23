# 001-01 — Convert & vendor KhitHaungg woff2 fonts

Plan: `001-root-khithaungg-myanmar-font.md` · Blocked by: — · Parallel-safe with: —

## Goal

Produce 4 KhitHaungg `.woff2` files (weights 400/500/600/700) and place them in `landing/public/fonts/`.

## Context

- Source files: `workflow/ideas/fonts/Z20-KhitHaungg-{Regular,Medium,SemiBold,Bold}.otf` (~42KB each, OTF/CFF outlines).
- Weight mapping: Regular→400, Medium→500, SemiBold→600, Bold→700.
- Output naming (resolved): weight-numbered, kebab-case → `khithaungg-400.woff2`, `khithaungg-500.woff2`, `khithaungg-600.woff2`, `khithaungg-700.woff2`.
- Target dir `landing/public/fonts/` does **not** exist yet (only `landing/public/openmyanmarlabs-icon.svg`). Vite serves `public/` as-is, so these resolve at `/fonts/khithaungg-400.woff2`.
- No woff2 tooling on PATH. Repo runtime is Bun (`bunx` available); `npx` also available.
- woff2 is a container — OTF/CFF converts without glyph loss.

## Steps

- [ ] Create `landing/public/fonts/`.
- [ ] Convert each `.otf` → `.woff2`. Prefer `fonttools`:
      `pip install fonttools brotli` then per file
      `fonttools ttLib.woff2 compress -o landing/public/fonts/khithaungg-400.woff2 workflow/ideas/fonts/Z20-KhitHaungg-Regular.otf` (repeat for 500/600/700).
      Fallback: `bunx ttf2woff2 < in.otf > out.woff2` (accepts OTF).
- [ ] Confirm all 4 woff2 files exist in `landing/public/fonts/` and are non-empty / smaller than their source `.otf`.
- [ ] Record the exact command used (in commit message or a short note) per spec's "document the command" constraint.

## Done when

- `landing/public/fonts/khithaungg-{400,500,600,700}.woff2` all present and non-empty.
- Each woff2 is ≤ its source `.otf` size (confirms real compression).
- The conversion command is documented.

## Touches

- `landing/public/fonts/` — new dir + 4 `.woff2` assets.
