# Spec — Open Myanmar Invoice (2026-05-24)

One-line: Myanmar-first, offline desktop invoice app — build invoices from clients + products with taxes, preview, export PDF/image — rebuilt on the Electrobun template with SQLite persistence and images stored on disk (not base64).

Source: `workflow/ideas/open-myanmar-invoice/idea.md`
Functional reference (what): `workflow/learning/invoice-maker/`
Stack reference (how): `apps/electrobun-template` + `workflow/learning/electron-bun/`

## Goal

New app `apps/open-myanmar-invoice`, forked from `apps/electrobun-template`. Re-implement the invoice-maker **core idea** (company → clients → products → invoice builder → export) as a native, single-user, offline desktop app. Drop the old CRA/Redux/localforage/base64 stack; use the template's Vite 7 + React 19 + Tailwind 4 + zustand + SQLite/Drizzle + typed RPC + EN/MM i18n + updater + packaging. Images live on the user's disk, referenced by path in SQLite.

## Users / context

- **Single user, offline, on-device.** One person managing their own company's invoices. No accounts, no multi-user, no cloud.
- **Myanmar-first** — default language `my`, English available. All UI copy bilingual via the template's `content.ts`.
- Desktop: macOS / Windows / Linux via Electrobun (tray, app menu, installer, auto-update).

## Scope

**In:**

- Fork + rename: `apps/open-myanmar-invoice`, new `app.name` + `app.identifier` in `electrobun.config.ts`, `package.json` name, new icon (`add-icon` skill).
- **Strip auth** — remove login/register/sessions, `users`/`sessions` tables, `auth-service`, `ProtectedRoute`/`GuestOnly`. App opens straight to the dashboard.
- **Company profile** (single record) — name, email, mobile, address, logo (on-disk path). Plus app settings: `default_currency`, invoice-number `prefix`. Snapshotted onto each invoice at save.
- **Clients CRUD** — list (search + pagination, 10/page), create (inline form), edit (modal), delete (confirm). Searchable selector modal (6/page) for the builder. Fields: name, email, mobile, billing address, image (on-disk path).
- **Products CRUD** — same list/edit/delete/selector patterns. Fields: name, product_id (SKU), amount (price), image (on-disk path). Selector appends product as a line (qty 1).
- **Invoice builder** (the heart) — line items, %/flat taxes, single app currency, color + background, Draft→Unpaid→Paid status with edit-lock, view/edit modes, save handshake. See `workflow/learning/invoice-maker/guides/05-invoice-builder.md`.
- **Calculations** — port `utils/match.js` pure fns (subtotal, % + flat taxes, total, truncate-2-decimal trick). First TDD target.
- **Invoice list** — `SELECT` from one table (no second denormalized array). Search, pagination (10/page), status pills, detail/delete row actions.
- **Dashboard** — widgets: total balance (Σ invoice totals), #clients, #products, #invoices. Recent invoices.
- **Image-on-disk pipeline** — upload bytes over RPC → `Bun.write(userData/images/<nanoid>.<ext>)` → store relative path in SQLite; display via `rpc.getImage(path)` → bytes → `URL.createObjectURL`.
- **Export** — invoice → PDF + image, renderer-rasterized, written to disk natively (below).
- **i18n** — all new copy in EN + MM, Myanmar-first.

**Out (non-goals):**

- Auth, accounts, sessions, multi-user, app lock/PIN.
- Cloud sync, network, online features — fully offline.
- Multi-currency / per-invoice currency picker — one app-wide currency.
- `react-number-format`, `react-to-print`, `dom-to-image`, Redux, localforage, CRA — none carried over.
- Recurring invoices, payment-gateway integration, email-sending, partial payments.
- Carrying over the old base64 image catalog (~10 MB) embedded in state.
- Lottie dashboard animations (optional polish at most; not required).
- Migrating any old browser data (greenfield; no import from the CRA app).

## Requirements

### Scaffold

- [ ] Copy `apps/electrobun-template` → `apps/open-myanmar-invoice`; rename `app.name`, `app.identifier`, `package.json` name; new app icon.
- [ ] Remove auth feature slice, `users`/`sessions` schema, auth RPC/service/store/guards; router opens to dashboard with no guards.

### Data model (Drizzle, template conventions: text ids, epoch-ms integer dates, `*_en`/`*_my` where bilingual)

- [ ] `company` — single row: name, email, mobile, address, `logo_path`, `default_currency`, `invoice_prefix`.
- [ ] `clients` — id, name, email, mobile, billing_address, `image_path`.
- [ ] `products` — id, name, `product_id` (SKU), amount, `image_path`.
- [ ] `invoices` — id, `invoice_no`, `status` (int: 1 Draft / 2 Unpaid / 3 Paid), `total_amount`, `color`, `background_ref` (`builtin:<id>` | `file:<path>` | null), `due_date`, `created_date`, `client_id` (nullable FK → clients), `client_snapshot` (JSON), `company_snapshot` (JSON).
- [ ] `invoice_items` — id, `invoice_id` (FK, cascade), `product_id` (nullable), name, amount, quantity.
- [ ] `invoice_taxes` — id, `invoice_id` (FK, cascade), title, type (`percentage`|`flat`), value, amount.
- [ ] Repos → services → handlers follow template DI (`createXRepository(db)` → `createXService(repo)` → `createXHandlers(service)`), unit + e2e testable headlessly.

### Calculations (TDD — `tdd` skill)

- [ ] `sumProductTotal(items)` — Σ (quantity × amount) per line, truncate-2-decimal per line, then sum.
- [ ] Percentage tax (max 1): `amount = value/100 × subtotal`, recomputed on item change; refuse a 2nd % tax.
- [ ] Flat tax (unlimited): `value === amount`.
- [ ] `total = subtotal + Σ tax amounts`, truncate-2-decimal.
- [ ] Truncate trick: `value.toFixed(4).slice(0, -2)` (truncate, not round); integers bypass (no `.00`).

### Invoice builder

- [ ] New invoice (`/invoices/new`): prefill `invoice_no` = `<prefix>-<max+1>` zero-padded (editable), snapshot current company, `created_date` = now, editable.
- [ ] Existing invoice: load, open **view-only**, restore color/background.
- [ ] Line items: add blank row (qty 1, amount 1) or pick from product selector (appends). Inline validate: quantity `/^\d+$/`, amount `/^[0-9]\d*(\.\d+)?$/`, both > 0. Change recomputes subtotal → re-applies % tax → total. Delete recalculates.
- [ ] Taxes: add %/flat, inline validate (`0 < v ≤ 100` for %, `v > 0` for flat); delete recalculates.
- [ ] Client: pick from selector (copies into `client_snapshot` + sets `client_id`) or edit fields directly.
- [ ] Status: 1 Draft (fully editable), 2 Unpaid (read-only), 3 Paid (terminal, read-only, action bar hidden). **Edit only allowed when status = Draft**; else toast "edit only in Draft".
- [ ] Save handshake: choose status → confirm modal → on confirm persist via RPC → return to list (new) or back to view mode (existing). Success toast.
- [ ] Currency: format money with `Intl.NumberFormat` using `company.default_currency` (app-wide; no per-invoice picker).

### Images on disk (RPC pipeline)

- [ ] `mkdirSync(join(Utils.paths.userData, "images"), { recursive: true })` at startup. Never write into bundle/Resources.
- [ ] `rpc.saveImage({ bytes, ext })` → `Bun.write(userData/images/<nanoid>.<ext>)` → return relative path; store path string in SQLite (never bytes).
- [ ] `rpc.getImage({ path })` → `Bun.file(path).arrayBuffer()` → renderer `URL.createObjectURL(new Blob([bytes]))` → `<img src>`.
- [ ] Used by company logo, client image, product image, and user-supplied invoice backgrounds.

### Backgrounds & color

- [ ] Curated built-in background set (~6–8) bundled, served read-only via `views://`; referenced `builtin:<id>`.
- [ ] User-supplied backgrounds via the image pipeline; referenced `file:<path>`.
- [ ] Color picker (hex), default applied to new invoices.

### Export (renderer-rasterize → native save)

- [ ] Renderer rasterizes the invoice DOM to bytes: image = html-to-image → PNG/JPEG; PDF = that PNG embedded via `pdf-lib`/`jsPDF`. (No `react-to-print`/`dom-to-image`.)
- [ ] Keep the `isExporting` desktop-layout swap (fixed-width invoice for clean output) + hide inputs (view mode) during capture.
- [ ] `rpc.saveExport({ bytes, name, kind })` → main `Bun.write` to `Utils.paths.downloads` (or a directory chosen via `Utils.openFileDialog({ canChooseDirectory: true })`), then `Utils.showItemInFolder(path)` to reveal.

### Dashboard

- [ ] Widgets: total balance (Σ `total_amount`), #clients, #products, #invoices — all via SQL counts/sums. Recent invoices.

## Constraints

- **Tech:** template stack only — Vite 7, React 19, Tailwind 4, zustand, bun:sqlite + Drizzle, typed RPC (Electrobun `defineRPC`), zod + react-hook-form, react-router 7 hash router. No new deps beyond the export rasterizer/PDF lib (`html-to-image`, `pdf-lib`/`jsPDF`) and `nanoid`.
- **Electrobun reality (verified, KB):** no native print/print-to-PDF, no native screenshot/image capture, no native _save_ dialog. `window.print()` in the webview is unverified. Available: `Bun.write` (main), RPC byte hand-off, `Utils.openFileDialog` (open/dir), `Utils.paths.*`, `Utils.showItemInFolder`/`openPath`. Export must therefore generate bytes in the renderer and persist via main.
- **Offline:** 100% on-device. SQLite at `Utils.paths.userData/app.db`; images at `userData/images/`; backups at `userData/backups/` (template-provided). No network calls except the existing updater.
- **i18n:** Myanmar-first; `my` is source of truth, `en: Content = typeof my` enforces key symmetry. No untranslated strings.
- **Persistence safety:** editing a client/company/product must never alter past invoices (guaranteed by `*_snapshot` JSON + child-table item/tax copies).
- **RPC payload:** image/export bytes cross RPC; KB flags marshalling overhead for large blobs — acceptable for logos/photos/single-page invoices; verify in the image + export phases.
- **Money:** JS-float amounts with truncate-2-decimal display (ported as-is); not true decimal math.

## Acceptance — done when

- [ ] `apps/open-myanmar-invoice` builds + runs as a native Electrobun app with its own name/identifier/icon; no login screen — opens to the dashboard.
- [ ] Company profile, clients, products: full CRUD with search + pagination; images chosen by the user persist to `userData/images/` and render back from disk (no base64 in DB).
- [ ] Invoice builder: create + edit an invoice with line items and % + flat taxes; totals match the ported `match.js` (truncate-2-decimal); status flows Draft→Unpaid→Paid with edit locked outside Draft; save handshake persists to SQLite.
- [ ] Editing a client/company after an invoice is saved does **not** change that past invoice.
- [ ] Invoice list is a single `SELECT`; dashboard widgets show correct counts + total balance.
- [ ] Export produces a PDF and an image of the invoice on disk and reveals them in the file manager.
- [ ] Backgrounds: a built-in image and a user-supplied image both apply to an invoice and appear in export.
- [ ] UI switches EN ↔ MM with no missing keys; default is Myanmar.
- [ ] Calculations + repositories/services covered by `bun test` (units via `tdd`, backend vertical via `backend-e2e`).

## Open questions

- **`pdf-lib` vs `jsPDF`** for wrapping the rasterized PNG into a PDF — pick in the export phase (both embed a PNG; `pdf-lib` is lighter/typed). Low risk.
- **Export quality/size** — rasterizing a styled invoice DOM to PNG then to PDF may produce large files / soft text. Spike acceptable output in the export phase; if poor, revisit `window.print()` ("Save as PDF") as an alternative.
- **Save destination UX** — default to `~/Downloads` + reveal, or always prompt for a directory via `openFileDialog`? Decide at export-phase build (default-to-Downloads is the lean first cut).
- **RPC blob size** — confirm acceptable latency for typical logos and a single-page export; revisit thumbnails in `userData`/`userCache` only if needed.

```

```
