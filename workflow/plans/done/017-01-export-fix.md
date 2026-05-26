# 017-01 — Export bug fix

Plan: `017-root-<slug>.md` · Blocked by: — · Parallel-safe with: 02, 03

## Goal

Diagnose and fix "Could not export. Please try again" for both PDF and image exports in the invoice builder.

## Context

**Export flow:**

1. Renderer snapshots `InvoiceExportStage` (off-screen, `left: -99999`, `isExporting=true`) via `html-to-image` + `pdf-lib`
2. Bytes serialised as `number[]`, sent over Electrobun RPC `exportApi.save`
3. Main process writes to Downloads dir + reveals in Finder

**Relevant files:**

- `apps/open-myanmar-invoice/src/features/invoices/pages/invoice-builder-page.tsx:187-205` — `runExport(kind)`. Catch block at line 200 silently calls `toast.error` with no `console.error`, so the real error is invisible.
- `apps/open-myanmar-invoice/src/features/invoices/lib/export.ts` — `captureWrapperDataUrl` (line 107) calls `waitForImages` → `waitForBackgroundImages` → `settle` → `toPng` → bytes. `captureInvoicePdf` wraps with `pdf-lib`.
- `apps/open-myanmar-invoice/src/bun/rpc/app-rpc.ts:56` — `maxRequestTime: 5000` (5 s timeout on all RPC calls via `BrowserView.defineRPC`).

**Two root causes:**

1. **RPC timeout** — rasterising a full 794 px invoice at pixelRatio 2, PNG-encoding, PDF-wrapping, JSON-serialising a `number[]` byte array across the Electrobun bridge can exceed 5 s (especially with a background image or logo). Timeout fires → renderer catch triggers → `exportError` toast.
2. **`blob:` URL serialisation** — company logo loaded as a `blob:` object URL via `useImageObjectUrl` (`src/lib/images.ts`). `html-to-image` re-fetches `<img src>` to base64-encode it; `blob:` URLs are origin-scoped and may not be reachable from the WebView's fetch path, causing a blank/errored capture that throws inside `captureWrapperDataUrl`.

## Steps

- [ ] **Add debug logging** — in `invoice-builder-page.tsx` catch block (line 200), change `catch {` to `catch (err) {` and add `console.error("[export]", err)` before the `toast.error` call. Run the app and trigger an export; read the DevTools console to confirm whether the error is a timeout, a fetch/blob error, or something else.

- [ ] **Increase RPC timeout** — in `app-rpc.ts` line 56, raise `maxRequestTime` from `5000` to `60000`. Export is a one-shot user action; a generous ceiling is safe.

- [ ] **Add `resolveBlobImages` helper** — in `export.ts`, before the `toPng` call in `captureWrapperDataUrl`, add a new async helper that finds all `<img>` elements whose `src` starts with `blob:` and rewrites them to inline `data:` URLs:

  ```ts
  async function resolveBlobImages(node: HTMLElement): Promise<void> {
    const imgs = Array.from(node.querySelectorAll<HTMLImageElement>("img"));
    await Promise.all(
      imgs
        .filter((img) => img.src.startsWith("blob:"))
        .map(
          (img) =>
            new Promise<void>((resolve) => {
              fetch(img.src)
                .then((r) => r.blob())
                .then(
                  (blob) =>
                    new Promise<void>((res) => {
                      const fr = new FileReader();
                      fr.onload = () => {
                        img.src = fr.result as string;
                        res();
                      };
                      fr.readAsDataURL(blob);
                    }),
                )
                .then(resolve)
                .catch(resolve); // non-fatal: skip unreadable blobs
            }),
        ),
    );
  }
  ```

  Call it inside `captureWrapperDataUrl`, after `waitForBackgroundImages(node)` and before `settle()`.

- [ ] **Clean up or keep debug logging** — once root cause confirmed and fix verified, either remove the `console.error` or promote it to a permanent debug log (`console.debug`). Document the choice with a brief inline comment.

- [ ] **Verify** — run the app, open a saved invoice (with a company logo if available), export as PDF and as image:
  - File appears in Downloads
  - Finder reveals it
  - Success toast shown
  - Repeat for invoices in Draft, Unpaid, and Paid status
  - Repeat without a logo (no regression)

## Done when

- `runExport("pdf")` completes without error; file lands in Downloads, Finder reveal fires, success toast shown
- `runExport("image")` same
- Works for Draft / Unpaid / Paid status
- Works with and without a company logo
- No unhandled-promise or uncaught errors in DevTools console during export

## Touches

- `apps/open-myanmar-invoice/src/bun/rpc/app-rpc.ts` — `maxRequestTime: 5000` → `60000`
- `apps/open-myanmar-invoice/src/features/invoices/lib/export.ts` — add `resolveBlobImages` helper; call inside `captureWrapperDataUrl`
- `apps/open-myanmar-invoice/src/features/invoices/pages/invoice-builder-page.tsx` — add/remove debug `console.error` in `runExport` catch
