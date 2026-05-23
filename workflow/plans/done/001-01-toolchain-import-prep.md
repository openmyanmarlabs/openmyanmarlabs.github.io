# 001-01 — Toolchain + import prep

Plan: `001-root-landing-typescript-migration.md` · Blocked by: — · Parallel-safe with: —

## Goal

Stand up the TS toolchain in `landing/` and prep imports so later file renames are
drop-in — without converting any component yet (src stays JS, app keeps working).

## Context

- `landing/` = Vite 7 + React 19 + motion 12, Bun runtime. No TS today.
- Spec: full strict, no `any`. Vite React-TS template baseline.
- Imports use explicit `.jsx`/`.js` extensions (see list in Steps) — these break
  renames. Strip to extensionless; Vite (`resolve.extensions`) + TS (`moduleResolution: bundler`)
  resolve extensionless to the eventual `.tsx`/`.ts`. **Keep `./styles/global.css`.**
- `allowJs: true` is intentional & temporary — lets the mixed JS/TS tree typecheck
  through phases 02–04. Phase 05 flips it off.
- This phase does NOT gate on `tsc` finding type errors (src still JS); it gates on
  config present + build/dev still green.

## Steps

- [ ] `cd landing && bun add -d typescript @types/react @types/react-dom`.
- [ ] Add `landing/tsconfig.json`: `strict: true`, `noUnusedLocals: true`,
      `noUnusedParameters: true`, `jsx: "react-jsx"`, `module: "ESNext"`,
      `moduleResolution: "bundler"`, `target: "ES2022"`, `lib: ["ES2022","DOM","DOM.Iterable"]`,
      `allowJs: true`, `checkJs: false`, `noEmit: true`, `skipLibCheck: true`,
      `isolatedModules: true`, `verbatimModuleSyntax: true`. `include: ["src"]`.
- [ ] Add `landing/tsconfig.node.json` for the Vite config (`include: ["vite.config.ts"]`,
      node-appropriate libs); reference it from `tsconfig.json` if using project refs,
      or keep standalone — `typecheck` only needs the app config.
- [ ] `landing/package.json`: add `"typecheck": "tsc --noEmit"` to scripts.
- [ ] Rename `vite.config.js` → `vite.config.ts` (content unchanged; `defineConfig` is typed).
- [ ] Strip explicit `.jsx`/`.js` from all relative imports in `src` (NOT `.css`): - `i18n.jsx`: `./content.js` → `./content` - `main.jsx`: `./i18n.jsx`→`./i18n`, `./app.jsx`→`./app` - `app.jsx`: 7× `./sections/*.jsx` → `./sections/*`, `./i18n.jsx`→`./i18n` - 7 `sections/*.jsx`: `../i18n.jsx` → `../i18n` - `shared-ui/index.js`: 6× `./*.jsx` → `./*`
- [ ] Verify nothing else references the stripped paths:
      `grep -rn 'from "\.\.\?/.*\.\(jsx\|js\)"' landing/src` → only `.css` may remain (none expected).

## Done when

- `landing/tsconfig.json`, `tsconfig.node.json`, `vite.config.ts` exist; TS devDeps installed.
- `typecheck` script present.
- No relative import in `src` carries a `.jsx`/`.js` extension (`.css` kept).
- `bunx tsc --noEmit` passes (allowJs covers the still-JS src — expect 0 errors).
- `bun run build` succeeds and `bun run dev` renders the page (still JS, unchanged).

## Touches

- `landing/package.json` — devDeps + typecheck script.
- `landing/tsconfig.json`, `landing/tsconfig.node.json` — new.
- `landing/vite.config.js` → `landing/vite.config.ts`.
- `landing/src/**` — import specifiers only (no logic changes).
