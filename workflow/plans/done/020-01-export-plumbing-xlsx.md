# 020-01 — Export plumbing: `xlsx` kind + exceljs install

Plan: `020-root-report-excel-export-ui-revamp.md` · Blocked by: — · Parallel-safe with: 02, 04

## Goal

Teach the export pipeline a new `"xlsx"` kind (type + extension), install exceljs, and **prove exceljs produces a workbook buffer in the Vite renderer build** — de-risking the spec's #1 unknown before the builder phase depends on it.

## Context

The export pipeline is content-agnostic: bytes are produced in the renderer, `saveExport` writes them as-is + reveals the file. Adding a format = extend three small type unions + the extension map; `saveExport` logic itself needs no change.

Files + current state:

- `src/bun/rpc/export-paths.ts` — `extForKind(kind)` + `buildExportFilename(name, kind)`, both typed `"pdf" | "image" | "json"`. PURE, already unit-tested. `extForKind`: pdf→"pdf", json→"json", else "png". Add `xlsx → "xlsx"`.
- `src/bun/rpc/export-handlers.ts` — `export type ExportKind = "pdf" | "image" | "json"`. `saveExport` writes `Uint8Array.from(bytes)` + reveals (no logic change). Tested in `export-handlers.test.ts`.
- `src/lib/rpc.ts` (~line 117) — `exportApi.save(bytes: number[], name: string, kind: "pdf" | "image" | "json")`. Add `"xlsx"`.

TDD — pure/handler-logic changes with existing test files. Follow `.claude/skills/tdd/SKILL.md` (in-memory + DI fakes; do NOT import `migrate.ts`). Assertion first, then the one-line type/map change.

exceljs ships its own TypeScript types (no `@types/exceljs` needed). Runtime is Bun; install from the app dir.

## Steps

- [ ] **(red)** `export-paths.test.ts`: add `extForKind("xlsx") === "xlsx"` and `buildExportFilename("invoices-2025", "xlsx") === "invoices-2025.xlsx"`. `bun test export-paths` → fails.
- [ ] **(green)** Add `"xlsx"` to both param unions in `export-paths.ts`; `extForKind`: `if (kind === "xlsx") return "xlsx"`. Re-run → green.
- [ ] **(red→green)** `export-handlers.test.ts`: add a `saveExport` case `kind: "xlsx"` asserting the path ends `.xlsx`. Add `"xlsx"` to `ExportKind` in `export-handlers.ts`. → green.
- [ ] `rpc.ts`: extend `exportApi.save`'s `kind` union → `"pdf" | "image" | "json" | "xlsx"`.
- [ ] From `apps/open-myanmar-invoice`: `bun add exceljs`. Record the resolved version in the phase outcome.
- [ ] **exceljs renderer smoke (the real risk check):** add a TEMPORARY renderer-side import + call (e.g. a dev-only effect or a throwaway `export-xlsx-smoke.ts` imported by a renderer module) doing `new ExcelJS.Workbook()` → add a sheet + one cell → `await wb.xlsx.writeBuffer()`. Run the project's **renderer/Vite build** (`bun run build` or the project's build script) — it MUST bundle with no `buffer`/`stream`/ESM-CJS errors. If feasible, launch the app and trigger the call to confirm `writeBuffer()` returns non-empty bytes at runtime in the WebView. Remove the throwaway after.
- [ ] If the renderer build fails on exceljs: STOP. Record the error + the `exceljs/dist/exceljs.min.js` (browser build) vs bun-main-process options in the phase outcome and flag the user — this re-shapes phase 03.

## Done when

- `bun test export-paths export-handlers` green, including the new `xlsx` cases.
- `extForKind` / `buildExportFilename` / `ExportKind` / `exportApi.save` all accept `"xlsx"` → `.xlsx`.
- exceljs is in `package.json` + lockfile.
- An exceljs `writeBuffer()` import bundles in the **renderer build** (and ideally runs in the WebView) — OR the bundling failure + chosen fallback is documented and flagged.

## Touches

- `apps/open-myanmar-invoice/src/bun/rpc/export-paths.ts` — add `xlsx` kind/ext.
- `apps/open-myanmar-invoice/src/bun/rpc/export-paths.test.ts` — xlsx cases.
- `apps/open-myanmar-invoice/src/bun/rpc/export-handlers.ts` — `ExportKind` += `xlsx`.
- `apps/open-myanmar-invoice/src/bun/rpc/export-handlers.test.ts` — xlsx case.
- `apps/open-myanmar-invoice/src/lib/rpc.ts` — `exportApi.save` union += `xlsx`.
- `apps/open-myanmar-invoice/package.json` (+ lockfile) — add exceljs.
