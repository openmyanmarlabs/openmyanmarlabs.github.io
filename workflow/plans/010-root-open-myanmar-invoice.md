# Plan 010 — Open Myanmar Invoice (desktop)

Source: `workflow/specs/2026-05-24-open-myanmar-invoice.md`
Functional ref (what): `workflow/learning/invoice-maker/` · Stack ref (how): `apps/electrobun-template` + `workflow/learning/electron-bun/`

## Summary

Fork `apps/electrobun-template` → `apps/open-myanmar-invoice`; strip auth; re-implement the invoice-maker core idea (company → clients → products → invoice builder → export) as a Myanmar-first, offline desktop app. SQLite/Drizzle persistence, images on disk (paths, not base64), client/company snapshots on invoices, native-rasterize export. Backend is TDD'd (units) + e2e-gated (L1); UI built on the template's React 19 + Tailwind 4 + zustand + react-router 7 + EN/MM i18n.

## Phases

| #   | Phase                                      | File                                           | Blocked by         | Parallel-safe with |
| --- | ------------------------------------------ | ---------------------------------------------- | ------------------ | ------------------ |
| 01  | Scaffold + strip auth + icon               | `plans/todo/010-01-scaffold-strip-auth.md`     | —                  | —                  |
| 02  | Data model — schema + migrations + seed    | `plans/todo/010-02-data-model.md`              | 01                 | 03                 |
| 03  | Calculations (TDD)                         | `plans/todo/010-03-calculations.md`            | 01                 | 02, 04             |
| 04  | Backend data layer + image-pipeline RPC    | `plans/todo/010-04-backend-data-layer.md`      | 02                 | 03                 |
| 05  | Company profile + settings UI              | `plans/todo/010-05-company-settings-ui.md`     | 04                 | 06, 07             |
| 06  | Clients CRUD UI + selector modal           | `plans/todo/010-06-clients-crud-ui.md`         | 04                 | 05, 07             |
| 07  | Products CRUD UI + selector modal          | `plans/todo/010-07-products-crud-ui.md`        | 04                 | 05, 06             |
| 08  | Invoice builder UI (+ color + backgrounds) | `plans/todo/010-08-invoice-builder.md`         | 03, 04, 06, 07     | —                  |
| 09  | Export — rasterize → native save           | `plans/todo/010-09-export.md`                  | 08                 | 10                 |
| 10  | Dashboard + invoice list + i18n + L1 e2e   | `plans/todo/010-10-dashboard-list-i18n-e2e.md` | 04, 05, 06, 07, 08 | 09                 |

Critical path: **01 → 02 → 04 → {05,06,07} → 08 → {09,10}**. Two parallel waves: {02,03} early, {05,06,07} mid.

## Skills per phase (executor reference)

- **01** — `add-icon` (app icon from source PNG); `run` (confirm it launches to dashboard). Electrobun config: `workflow/learning/electron-bun/`.
- **02** — Drizzle/`drizzle-kit generate`; seed pattern per plan `009`. Light.
- **03** — `tdd` (`.claude/skills/tdd/SKILL.md`) — red→green→refactor on pure calc fns.
- **04** — `tdd` (repos/services units) **+** `backend-e2e` (`.claude/skills/backend-e2e/SKILL.md`) transport-free handler seam.
- **05 / 06 / 07** — `frontend-design`; **consult `tailwind-docs-reader` before writing CSS** (v4 syntax).
- **08** — `frontend-design` + `tailwind-docs-reader`; `tdd` for any pure builder/store logic.
- **09** — `electrobun-docs-reader` (Bun.write / `Utils.openFileDialog` / `Utils.showItemInFolder` / `Utils.paths`); `run` + `verify` to confirm files land + reveal.
- **10** — `backend-e2e` (L1 suite over assembled main process); `frontend-design` + `tailwind-docs-reader`; `verify` (manual native-GUI walk).

## Notes / risks

- **Shared-file chokepoints.** Parallel UI phases (05/06/07) each append to `src/shared/types.ts` (RPC contract), `src/lib/rpc.ts`, `src/routes/index.tsx`, `src/lib/i18n/content.ts`. Executors must **add only their own keys/routes/handlers** — append, never rewrite — or coordinate via sequential runs if conflicts surface. Backend RPC contract is built once in 04 to minimize this.
- **Export is the headline risk (verified).** Electrobun has **no** native print-to-PDF, screenshot, or save dialog (`workflow/learning/electron-bun/apis/utils.md`, `apis/browser-window.md`). Approach = renderer rasterizes DOM → bytes → RPC → `Bun.write` → `showItemInFolder`. Open: `pdf-lib` vs `jsPDF` (decide in 09); export quality/size — spike acceptable output, fall back to `window.print()` ("Save as PDF") if soft/large.
- **Curated backgrounds = Vite assets.** Template uses Vite for views (no `build.copy`); `dist/` → `views/main` via `scripts/post-build.ts`. Import background images as ES-module assets so Vite handles dev + prod URLs — do **not** hand-wire `views://` strings. User-supplied images still go over RPC → blob URL (phase 04).
- **TDD discipline (03, 04).** In-memory SQLite + DI; **never import `src/bun/db/migrate.ts` in tests** (it boots the Electrobun runtime). Co-located `*.test.ts`, `bun test`.
- **RPC blob size.** Image + export bytes cross RPC; KB flags marshalling overhead. Verify latency for typical logos + single-page export in 04/09; revisit thumbnails (`userCache`) only if needed.
- **Manual acceptance (can't automate)** — final `verify`-skill walk: relaunch → data persists; no FOUC; EN/MM toggle with no missing keys + Burmese font; pick built-in + user background; export PDF + image to disk and reveal; edit a client and confirm a past invoice is unchanged.
- **Money** — JS floats + truncate-2-decimal display ported as-is (not true decimal math); acceptable per spec.
- Nothing executed — phases sit in `plans/todo/`. Move each to `plans/done/` as it ships (`plan-execute` handles this).
