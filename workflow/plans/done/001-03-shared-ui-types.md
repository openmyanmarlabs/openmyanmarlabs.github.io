# 001-03 — Typed shared-ui

Plan: `001-root-landing-typescript-migration.md` · Blocked by: 01 · Parallel-safe with: 02

## Goal

Convert the 6 presentational primitives + barrel to TS with proper prop types.
Independent of the data layer — these import only `motion` + `react`.

## Context

- Files: `shared-ui/{badge,button,card,count-up,reveal,stat-tile}.jsx` + `index.js`.
- Confirmed: none import `content`/`i18n` — purely presentational, so this phase is
  fully parallel-safe with phase 02 (disjoint files).
- Each component's docstring already specifies its prop contract — type to match it,
  don't invent. Highlights:
  - **button.jsx**: `variant: "primary"|"secondary"|"ghost"`, `size: "sm"|"md"|"lg"`,
    polymorphic `as` (default `"button"`), `type`, `style`, `children`, `...rest`
    forwarded. Uses `motion.create(as)`. **Fiddliest type in the plan** — `as` +
    motion props + forwarded rest. Prefer a constrained generic over `any`; if
    `motion.create(as)` resists, type `as` as `ElementType` and props pragmatically,
    but keep `variant`/`size` as strict unions. (Spec: no `any` — exhaust options first.)
  - **count-up.jsx**: `to: number` (required), `from`, `duration`, `decimals: number`,
    `prefix`/`suffix: ReactNode`, `format?: (n: number) => string`, `...rest` on `<span>`.
  - **reveal.jsx**: wraps `Children`; type `children: ReactNode` + motion/stagger props.
  - **badge.jsx**: maps a status to a pill — type its `status`/variant prop (align with
    `"live"|"soon"` shape; badge stays presentational, copy comes from callers).
  - **card.jsx**, **stat-tile.jsx**: type per their docstrings.
- `allowJs` on; converting these won't break unconverted sections (they import the
  barrel extensionless → resolves to `index.ts`).

## Steps

- [ ] Convert each `.jsx` → `.tsx`, adding a typed props interface/type per its docstring:
      `badge`, `button`, `card`, `count-up`, `reveal`, `stat-tile`.
- [ ] `shared-ui/index.js` → `index.ts` (re-exports already extensionless from phase 01).
      Optionally also `export type` the public prop types for section consumers.
- [ ] Resolve `button.tsx`'s polymorphic `as` + `motion.create` typing without `any`;
      document the chosen approach in a short comment if non-obvious.
- [ ] `bunx tsc --noEmit` → clean.

## Done when

- All 6 components + barrel are `.tsx`/`.ts`; no `.jsx`/`.js` in `shared-ui/`.
- Prop types match each docstring; `variant`/`size`/numeric props are precise (no `any`).
- `bunx tsc --noEmit` clean.

## Touches

- `landing/src/shared-ui/{badge,button,card,count-up,reveal,stat-tile}.jsx` → `.tsx`.
- `landing/src/shared-ui/index.js` → `index.ts`.
