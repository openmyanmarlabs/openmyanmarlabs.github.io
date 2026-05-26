# Plan 020 — Invoice Report: Excel Export + UI Revamp

Source: `workflow/specs/2026-05-26-invoice-report-excel-export-ui-revamp.md`

## Summary

Replace the `/reports` page's JSON export with a styled Excel (`.xlsx`) export — exceljs, built in the renderer, shipped through the existing `saveExport` pipeline — and revamp the page: period switcher + export buttons on one toolbar row, money-card count-up, refined + animated charts. Two near-independent tracks: the Excel plumbing/builder (01 → 03, plus 02 copy) and the UI revamp (04), joined only by living in the same feature.

## Phases

| #   | Phase                                          | File                                            | Blocked by | Parallel-safe with |
| --- | ---------------------------------------------- | ----------------------------------------------- | ---------- | ------------------ |
| 01  | Export plumbing: `xlsx` kind + exceljs install | `plans/todo/020-01-export-plumbing-xlsx.md`     | —          | 02, 04             |
| 02  | i18n: Excel column copy                        | `plans/todo/020-02-i18n-excel-copy.md`          | —          | 01, 04             |
| 03  | Excel builder + wire modals (replace JSON)     | `plans/todo/020-03-excel-builder-modals.md`     | 01, 02     | 04                 |
| 04  | UI revamp: toolbar + card/chart polish         | `plans/todo/020-04-ui-revamp-toolbar-polish.md` | —          | 01, 02, 03         |

Critical path: **01 (or 02) → 03**. Phase 04 runs alongside the whole Excel track.
Waves: **W1 (parallel)** = 01, 02, 04 · **W2** = 03.

## Notes / risks

- **exceljs in the Vite renderer is the #1 risk** (spec open question). Phase 01 installs it AND smoke-tests an exceljs import + `writeBuffer()` in the **renderer build** — a passing `bun test` does NOT prove Vite bundling. If it won't bundle (needs a `buffer`/`stream` polyfill or the `exceljs/dist/exceljs.min.js` browser build), 01 records it + **flags before 03 starts**. Fallback: generate the `.xlsx` in the **bun main process** (new `exportXlsx` RPC, rows fetched there, localized labels passed as params) — that re-shapes 03.
- **No new cross-process logic**: `exportInvoices` is unchanged (already tested in plan 019). The only backend change is adding `"xlsx"` to the kind/extension type, covered by extending the existing `export-paths.test.ts` / `export-handlers.test.ts` in 01 — so **no new backend-e2e gate** is warranted.
- `StatCard` is shared with the dashboard; 04 adds only an OPTIONAL `format` prop. Dashboard calls pass pre-formatted strings (not numbers) → unaffected.
- **Manual `verify` walk (cannot be automated)** after 03 + 04: run the app → Export by year + by range → confirm the file lands in Downloads + is revealed → open the `.xlsx` (Excel / Numbers / LibreOffice): bold frozen header, money as right-aligned numbers, real date cells, localized status, only non-draft rows → toggle language, re-export, confirm headers/status switch language → confirm the toolbar is one row and wraps when narrow → confirm money cards count up + charts animate in, and that OS reduced-motion disables both.
- Filename bases unchanged (`invoices-<Y>`, `invoices-<from>-to-<to>`); only the extension becomes `.xlsx`.
