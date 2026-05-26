# Plan 015 — Open Myanmar Invoice UX Fixes (round 2)

Source: `workflow/specs/2026-05-25-invoice-ux-fixes-2.md`
Builds on: plan 014 (round 1 shell, money, light-only).

## Summary

Second polish pass on `apps/open-myanmar-invoice`, renderer + one additive DB column:
newest-first clients/products (new `created_at`), image skeleton loaders, a cleaner
app-bar/sidebar (toggle moves into the rail), and a revamped dashboard (greeting hero +
quick actions + CSS-only micro-animations). English-only brand title.

All four phases are **mutually parallel-safe** — disjoint files. `content.ts` + `global.css`
are edited only by phase 04; phase 02 uses built-in `animate-pulse` (no `global.css`); the
English-title flip lives in 04 (the `content.ts` owner), so phase 03 makes no `content.ts` edit.

## Phases

| #   | Phase                              | File                                           | Blocked by | Parallel-safe with |
| --- | ---------------------------------- | ---------------------------------------------- | ---------- | ------------------ |
| 01  | Newest-first data layer (TDD)      | `plans/todo/015-01-newest-first-data-layer.md` | —          | 02, 03, 04         |
| 02  | Image skeleton loaders             | `plans/todo/015-02-image-skeletons.md`         | —          | 01, 03, 04         |
| 03  | App-bar + sidebar shell refinement | `plans/todo/015-03-app-bar-sidebar-shell.md`   | —          | 01, 02, 04         |
| 04  | Dashboard revamp + i18n + title    | `plans/todo/015-04-dashboard-revamp.md`        | —          | 01, 02, 03         |

One wave of four. Phase 01 is the only one with unit tests (TDD); 02–04 are renderer/UI, verified by running.

## Notes / risks

**Open questions — resolved at plan time:**

- **Backfill ordering** → set existing rows' `created_at = rowid`. rowid is monotonic with
  insertion, so `created_at DESC` exactly reverses today's order (newest-added first); new
  rows stamped with `Date.now()` (~1.7e12) always sort above backfilled rows (1,2,3…).
- **Pickers/search consistency** → yes, order both `list()` and `search()` newest-first. The
  selector modals already drive `list()`, so they inherit it for free (cheap).
- **Greeting style** → time-based (morning / afternoon / evening), 3×2 strings.
- **New Client / New Product targets** → link quick actions to existing routes
  (`/invoices/new`, `/clients`, `/products`); no deep-link / auto-open, no new routes.

**Risks / gotchas:**

- **Migration hand-edit (phase 01).** `drizzle-kit generate` emits an `ALTER … ADD COLUMN …
DEFAULT (unixepoch()*1000)`; SQLite rejects a non-constant default on ADD COLUMN → runtime
  `migrate()` throws. MUST hand-edit the generated `.sql` to a constant default + `UPDATE`
  backfill (leave the meta snapshot/journal untouched).
- **DTO type surgery (phase 01).** Adding `created_at` as `.notNull()` makes `$inferSelect`
  (`ClientRow`/`ProductRow`) require it → `ClientCreateDTO = Omit<ClientRow,"id">` would force
  the renderer to send it. Create/patch DTOs must exclude `created_at`. Caught by `typecheck`.
- **Export integrity (phase 02).** The skeleton must NOT reach `invoice-document.tsx` /
  `invoice-background.tsx` (rasterized PDF/image export) — they don't use `useImageObjectUrl`;
  leave them untouched.

**Manual verify (verify skill — not automatable):**

- Upgrade an existing pre-0003 DB (with clients/products): relaunch → rows present, order
  preserved (newest-added first), and a new add lands on top. The fresh-DB unit tests don't
  exercise the backfill path, so this is the gate for it.
- Loading an image shows a pulse → image; a no-image record shows its initial/glyph fallback;
  the exported invoice PDF/image is visually unchanged.
- App-bar title reads `Open Myanmar Invoice` in both EN and MY; collapse toggle in the rail
  collapses/expands and persists across relaunch; no-FOUC; fonts correct.
- OS `prefers-reduced-motion` actually suppresses the dashboard entrance/hover/count-up motion.

frontend-design polish (03, 04) and the count-up RAF hook (04) are UI → not unit-tested;
quality is verified by running.
