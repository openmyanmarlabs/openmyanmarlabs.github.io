# Spec — Landing TypeScript Migration (2026-05-23)

One-line: Convert the `landing/` Vite + React app from JS/JSX to TypeScript.
Source: `workflow/ideas/change-typescript.md`

## Goal

Migrate all source in `landing/` (the only app with code) from JavaScript to
TypeScript — `.jsx` → `.tsx`, `.js` → `.ts` — with no change to runtime behavior
or visuals. Add the TS toolchain (tsconfig, deps, typecheck) so future work is
type-safe.

## Users / context

Developers of the OML monorepo. Pure DX/quality change; end users see no
difference. Bilingual content (en/my) is untouched — only its types are added.

## Scope

**In:**

- Convert all 18 source files in `landing/src/` (app, main, i18n, content, 7
  `sections/`, 6 `shared-ui/` + barrel).
- `vite.config.js` → `vite.config.ts`; update `index.html` script src to `.tsx`.
- Add `landing/tsconfig.json` (+ `tsconfig.node.json` if needed for vite config).
- Add devDeps: `typescript`, `@types/react`, `@types/react-dom`.
- Add a `typecheck` script (`tsc --noEmit`).

**Out (non-goals):**

- Root/monorepo tsconfig or scaffolding `apps/` — landing only.
- design-system/ (no code) — untouched.
- Any feature, refactor, copy, or visual change beyond adding types.
- New runtime deps, test framework, ESLint, or CI wiring.

## Requirements

- [ ] Every `.jsx`/`.js` under `landing/src/` becomes `.tsx`/`.ts`; no JS source left.
- [ ] **Full strict** tsconfig: `strict: true` + `noUnusedLocals`/`noUnusedParameters`,
      Vite React-TS template baseline (bundler resolution, jsx: react-jsx, noEmit).
      No `any` escape hatches.
- [ ] **content + i18n typed by derivation:** `my` is source of truth; `en` typed
      so its shape must equal `my` (asymmetric keys = compile error). `status` is a
      `"live" | "soon"` literal union (via `as const`/literal types). `useI18n()`
      return (`lang`, `setLang`, `toggleLang`, `isMyanmar`, `t`) fully typed; no `null` leaks.
- [ ] Component props typed for all `shared-ui` + `sections` (Button variant/size
      unions, CountUp numerics, etc.).
- [ ] `bunx tsc --noEmit` passes clean.
- [ ] `bun run build` (vite) succeeds; app renders identically in en + my.
- [ ] File names stay kebab-case per `landing/CLAUDE.md`.

## Constraints

- Runtime: Bun (`bunx tsc`). Auto-prettier on Write/Edit.
- React 19 + Vite 7 + motion 12 (typing `motion.create(as)` is the fiddliest spot).
- i18n: en/my content trees must stay key-symmetric — now enforced by the type system.
- Offline: N/A — no runtime/network behavior changes.

## Acceptance — done when

- No `.js`/`.jsx` remain in `landing/src/`; `vite.config.ts` present; `index.html`
  points at `/src/main.tsx`.
- `bunx tsc --noEmit` clean; `bun run build` succeeds.
- `typecheck` script added to `landing/package.json`.
- Dev server runs and the page renders correctly; toggling en ⇄ my works and the
  page looks unchanged (visual smoke check).
