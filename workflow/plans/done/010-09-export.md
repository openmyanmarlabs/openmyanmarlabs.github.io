# 010-09 — Export: rasterize → native save

Plan: `010-root-open-myanmar-invoice.md` · Blocked by: 08 · Parallel-safe with: 10

## Goal

From an open invoice, export to a PDF file and an image file on disk, then reveal them in the OS file manager — renderer-rasterized bytes handed to main for native write.

## Context

- **Verified constraint (don't fight it):** Electrobun has NO native print-to-PDF, NO screenshot/capture, NO save dialog (`workflow/learning/electron-bun/apis/utils.md`, `apis/browser-window.md`, `apis/browser-view.md`). `window.print()` in the webview is unverified. So bytes are produced in the **renderer**, written by **main**. Re-confirm specifics with the **`electrobun-docs-reader`** subagent before wiring (Bun.write, `Utils.openFileDialog`, `Utils.showItemInFolder`, `Utils.paths.downloads`).
- Renderer rasterize: capture the builder's `#invoice-wrapper` (built in 08) with **`html-to-image`** → PNG/JPEG bytes (image export). PDF export = wrap that PNG into a single-page PDF. **Open decision — pick here:** `pdf-lib` (lighter, typed; embed PNG, set page size) vs `jsPDF` (`addImage`). Recommend `pdf-lib`. (`bun add html-to-image pdf-lib`.)
- Reuse the `isExporting` layout swap + view-mode (hide inputs) from 08 during capture, so output is the clean fixed-width invoice. Wait for background images (builtin asset + user blob URL) to decode before capturing (await image load / `requestAnimationFrame`), not a blind timeout where avoidable.
- Save path (RPC, added to the 04 contract pattern): `saveExport({ bytes, name, kind })` → main `Bun.write(join(Utils.paths.downloads, name), bytes)`; **lean first cut = default to Downloads**, then `Utils.showItemInFolder(path)` to reveal. (Stretch / open-q: offer a folder via `Utils.openFileDialog({ canChooseDirectory: true })` — there is no save dialog.)
- Filename: derive from `invoice_no` (e.g. `INV-0042.pdf` / `.png`); sanitize.
- i18n: append export button/labels + a success toast (en/my).
- **Spike the risk:** rasterizing a styled DOM may yield soft text or large files. Eyeball output quality/size; if poor, the documented fallback is `window.print()` ("Save as PDF") — log the result in the phase outcome either way.

## Steps

- [ ] Consult `electrobun-docs-reader` to confirm `Bun.write` / `Utils.paths.downloads` / `Utils.showItemInFolder` / `openFileDialog` signatures.
- [ ] Add `saveExport` RPC (handler: write bytes + reveal) to the contract + renderer wrapper.
- [ ] Renderer: `html-to-image` capture of `#invoice-wrapper` (with isExporting/view-mode + image-decode wait) → PNG/JPEG bytes → `saveExport(kind:"image")`.
- [ ] Renderer: wrap PNG into PDF via `pdf-lib` → bytes → `saveExport(kind:"pdf")`.
- [ ] Wire export buttons in the builder (Draft and non-Draft both exportable); success toast.
- [ ] i18n keys (en/my).
- [ ] **`run`/`verify`:** export an invoice → PDF + image appear in Downloads and the file manager opens to them; check legibility + file size; record spike result.

## Done when

- Exporting produces a readable PDF and an image of the invoice on disk and reveals them.
- Built-in + user-supplied backgrounds appear correctly in the exported output.
- `pdf-lib` vs `jsPDF` decision recorded; quality/size spike outcome noted (and fallback flagged if needed).
- Typecheck clean.

## Touches

- `src/features/invoices/**` — export buttons + capture/encode logic.
- `src/bun/rpc/image-handlers.ts` (or new `export-handlers.ts`), `src/shared/types.ts`, `src/lib/rpc.ts` — `saveExport`.
- `src/lib/i18n/content.ts` — append.
- `package.json` — `html-to-image`, `pdf-lib`.
