# 001-05 — Wiring, cleanup + verify

Plan: `001-root-landing-typescript-migration.md` · Blocked by: 04 · Parallel-safe with: —

## Goal

Convert the last entry files, point the HTML at the TS entry, drop the temporary
`allowJs`, and verify the whole migration: strict `tsc` clean, build green, page
unchanged in both languages.

## Context

- Last JS files: `app.jsx` (imports all sections + i18n) and `main.jsx` (imports app,
  i18n, `./styles/global.css`). Both extensionless already except the `.css` import — keep `.css`.
- `index.html` still loads `/src/main.jsx` — must move to `/src/main.tsx` _with_ the rename
  (do them together so dev/build never points at a missing file).
- `allowJs: true` was a migration scaffold; once no JS remains, flip to `false` for a
  true strict TS project. `verbatimModuleSyntax` may require `import type` for the
  `ReactNode`/type-only imports in `main.tsx`/`app.tsx`.
- Spec acceptance: `tsc --noEmit` clean **+** `vite build` **+** visual smoke (run dev,
  toggle en ⇄ my, page looks unchanged).

## Steps

- [ ] `app.jsx` → `app.tsx`; `main.jsx` → `main.tsx` (type the `createRoot` target —
      `document.getElementById("root")` is `HTMLElement | null`; assert or guard).
- [ ] `index.html`: `/src/main.jsx` → `/src/main.tsx`.
- [ ] Confirm no JS source remains: `find landing/src -name "*.js" -o -name "*.jsx"` → empty.
- [ ] `landing/tsconfig.json`: set `allowJs: false` (and drop `checkJs` if present).
- [ ] `bunx tsc --noEmit` → clean under strict (final gate).
- [ ] `bun run build` → succeeds.
- [ ] `bun run dev` → open the page; toggle en ⇄ my; confirm layout/copy/animations
      unchanged (visual smoke). Check `<html lang>` flips with the toggle.

## Done when

- `app.tsx` + `main.tsx` exist; `index.html` points at `/src/main.tsx`.
- Zero `.js`/`.jsx` under `landing/src`; `allowJs: false`.
- `bunx tsc --noEmit` clean (strict); `bun run build` succeeds.
- Dev server renders the page correctly; en ⇄ my toggle works and looks unchanged.

## Touches

- `landing/src/app.jsx` → `app.tsx`.
- `landing/src/main.jsx` → `main.tsx`.
- `landing/index.html` — script src.
- `landing/tsconfig.json` — `allowJs: false`.
