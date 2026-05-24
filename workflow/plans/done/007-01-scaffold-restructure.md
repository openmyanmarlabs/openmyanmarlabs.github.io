# 007-01 — Scaffold + restructure

Plan: `007-root-feature-slice-auth.md` · Blocked by: — · Parallel-safe with: —

## Goal

Flatten the renderer from `src/main-ui/` to a feature-slice `src/` tree, add the `@/` alias, install deps — app still builds + runs unchanged.

## Context

Foundational phase; every other phase depends on it. Touches only structure/config + file moves — **no new behavior**. Keep the app building green throughout.

Current layout (read these): `apps/electrobun-template/src/main-ui/{main.tsx,hello-page.tsx,about-page.tsx,content.ts,theme.tsx,i18n.tsx,language-toggle.tsx,theme-toggle.tsx,vite-env.d.ts,styles/global.css}`, `src/bun/index.ts`. Renderer is Vite-bundled, loaded over `http://localhost:5173` (dev) / `views://main/index.html` (prod, copied by `scripts/post-build.ts`). Entry today: `index.html` → `/src/main-ui/main.tsx`.

Target tree (create dirs; leave empty ones with a `.gitkeep` if needed):

```
src/
├── bun/                  # main process — keep src/bun/index.ts here
├── shared/               # cross-process contracts (created, filled in 02/06)
├── features/
│   ├── auth/             # pages/ components/ validations/ services/ (filled 06/07)
│   └── home/pages/       # hello-page.tsx + about-page.tsx move here
├── components/{ui,common,layout}/   # filled in 04/07
├── hooks/
├── stores/               # filled in 05
├── lib/
│   └── i18n/content.ts   # content.ts moves here
├── routes/               # router config (guards added in 07)
├── styles/global.css     # moved from main-ui/styles/
└── main.tsx              # renderer entry, moved up from main-ui/
```

This phase **moves** `content.ts`→`lib/i18n/content.ts`, `styles/global.css`→`styles/global.css`, `main.tsx`/`hello-page`/`about-page` (home pages → `features/home/pages/`), and leaves `i18n.tsx`/`theme.tsx`/`language-toggle.tsx`/`theme-toggle.tsx` **in place for now** (05 rewrites them as stores). Pick: either keep the 4 leftover files temporarily under `src/` (e.g. `src/_legacy/` or keep at `src/` root) and have moved files import them via `@/`, OR move them to their eventual homes (`components/common/` for toggles) updating imports. Simplest: move toggles → `components/common/`, move `i18n.tsx`/`theme.tsx` → `lib/` temporarily; 05 replaces them. Document whatever you choose in the phase notes.

Path alias `@/` → `src/`: add to both `vite.config.ts` (`resolve.alias`) and `tsconfig.json` (`compilerOptions.paths` + `baseUrl`). Use `@/` for cross-area imports going forward; deep relative imports otherwise get ugly.

Deps to install (spec §Deps): `drizzle-orm zustand zod react-hook-form @hookform/resolvers clsx tailwind-merge` and dev `drizzle-kit`. `bun:sqlite` + `Bun.password` are built-in (no install). Run from `apps/electrobun-template/` with `bun add` / `bun add -d`.

Tailwind/CSS: this phase only **moves** `global.css` (no content change). Auto-detection scans the whole `src/` tree as text, so the deeper tree is picked up without `@source` (per tailwind KB `guides/content-detection.md`). If any path-relative font URL in `global.css` breaks after the move, consult the `tailwind-docs-reader` subagent before editing CSS — keep the existing `@font-face` + `@theme` tokens verbatim.

## Steps

- [ ] `bun add drizzle-orm zustand zod react-hook-form @hookform/resolvers clsx tailwind-merge` + `bun add -d drizzle-kit` (in `apps/electrobun-template/`).
- [ ] Create the `src/` dir skeleton above.
- [ ] Move `src/main-ui/main.tsx` → `src/main.tsx`; `hello-page.tsx` + `about-page.tsx` → `src/features/home/pages/`; `content.ts` → `src/lib/i18n/content.ts`; `styles/global.css` → `src/styles/global.css`; toggles → `src/components/common/`; `i18n.tsx`/`theme.tsx` → `src/lib/` (temporary, 05 replaces). Delete the empty `src/main-ui/`.
- [ ] Add `@/` alias: `vite.config.ts` `resolve.alias { "@": "/src" }` (or `path.resolve`); `tsconfig.json` `baseUrl: "."` + `paths: { "@/*": ["src/*"] }`. Confirm `tsconfig.include` already covers `src` (it does).
- [ ] Update all imports broken by the moves (use `@/` for cross-area). Update `index.html` `<script src>` → `/src/main.tsx`.
- [ ] Verify `electrobun.config.ts` `build.bun.entrypoint = "src/bun/index.ts"` is unchanged (it is).
- [ ] `bun run typecheck`, `bun run build`, `bun start` — all green; window shows hello/about exactly as before.

## Done when

- `src/main-ui/` is gone; tree matches the target; all imports resolve.
- `@/` resolves in both Vite build and `tsc --noEmit`.
- `index.html` loads `/src/main.tsx`; bun entrypoint unchanged.
- Deps present in `package.json`; `bun.lock` updated.
- `bun run typecheck` green; `bun run build` yields a runnable `.app`; `bun start` HMR works; hello + about behave identically to before.

## Touches

- `package.json`, `bun.lock` — new deps.
- `vite.config.ts`, `tsconfig.json` — `@/` alias.
- `index.html` — entry path.
- `src/**` — file moves + import updates (no behavior change).
