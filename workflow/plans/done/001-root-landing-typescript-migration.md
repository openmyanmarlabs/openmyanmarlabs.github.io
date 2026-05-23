# Plan 001 — Landing TypeScript Migration

Source: `workflow/specs/2026-05-23-landing-typescript-migration.md`

## Summary

Convert `landing/` (Vite + React 19, 18 source files) from JS/JSX to TypeScript,
full strict, no behavior change. Bilingual `content` typed by derivation (en must
match my; `status` a literal union). Sequenced so the half-migrated tree stays
`tsc`-green at every phase via a temporary `allowJs`, flipped off at the end.

## Approach notes (read before executing)

- **Extensions stripped first.** Imports use explicit `.jsx`/`.js`
  (`from "../i18n.jsx"`). Phase 01 strips these to extensionless so later renames
  are drop-in — no importer edits when a file becomes `.tsx`. (`.css` keeps its ext.)
- **`allowJs: true` during migration.** `tsc` is all-or-nothing; with `allowJs`
  (+ `checkJs: false`) unconverted `.jsx` resolve but aren't checked, so each phase
  lands a clean `tsc --noEmit`. Phase 05 sets `allowJs: false` once no JS remains.
- **Critical path:** 01 → (02 ∥ 03) → 04 → 05.

## Phases

| #   | Phase                    | File                                         | Blocked by | Parallel-safe with |
| --- | ------------------------ | -------------------------------------------- | ---------- | ------------------ |
| 01  | Toolchain + import prep  | `plans/todo/001-01-toolchain-import-prep.md` | —          | —                  |
| 02  | Typed data + i18n        | `plans/todo/001-02-data-i18n-types.md`       | 01         | 03                 |
| 03  | Typed shared-ui          | `plans/todo/001-03-shared-ui-types.md`       | 01         | 02                 |
| 04  | Typed sections           | `plans/todo/001-04-section-types.md`         | 02, 03     | —                  |
| 05  | Wiring, cleanup + verify | `plans/todo/001-05-wiring-verify.md`         | 04         | —                  |

## Notes / risks

- **`motion.create(as)` in `button.jsx`** is the fiddliest type (polymorphic `as`
  - motion props). Flagged in spec. May need a constrained generic; avoid `any`.
- **`as const` over-narrowing** — applying `as const` to whole `content` makes every
  string a literal (verbose, readonly). Phase 02 narrows only what needs it (status)
  while deriving the shared shape. Watch for readonly friction in section consumers.
- Phase 01 can't gate on `tsc` clean for _typing_ (src still JS) — it gates on
  build/dev working + config present. `allowJs` keeps tsc passing regardless.
- No tests exist; verification is `tsc --noEmit` + `vite build` + manual visual smoke.
