# Idea — Open Myanmar Invoice (desktop)

Port the browser invoice-maker to a real desktop app on our Electrobun stack. New app: `apps/open-myanmar-invoice`, forked from `apps/electrobun-template`.

## The idea (in one line)

Take the **core idea** of `apps/invoice-maker` (documented in `workflow/learning/invoice-maker/`) — build invoices from clients + products with taxes, preview, export PDF/image — and rebuild it as a Myanmar-first, offline desktop app with proper local persistence and **images stored on the user's disk, not base64**.

## Why move off the browser version

- The old app is **Create React App** (react-scripts 5) — a tech stack we're not keeping.
- It stores **everything in the browser** (localforage/IndexedDB). Fragile, single-browser, no real file handling.
- Images are **base64 in state + IndexedDB** — `imageData.json` alone is ~10 MB of background images. Bloated, slow.
- No native feel: no real window, tray, app menu, auto-update, or OS file dialogs.
- We already built a great base (`electrobun-template`): React 19 + Vite + SQLite + RPC + i18n + updater. Reuse it.

## Approach

1. Copy `apps/electrobun-template` → `apps/open-myanmar-invoice`. Rename app name/identifier in `electrobun.config.ts` + `package.json`. New icon (`add-icon` skill).
2. **Don't carry over the old tech stack.** Use what the template already gives us (below).
3. Re-implement the invoice-maker **core idea**, not its code. The learning docs are the spec of _what_, the template decides _how_.
4. Images → filesystem via the Bun main process.

## Tech stack (from the template — already prepared)

| Concern         | Old (invoice-maker)          | New (this app)                                     |
| --------------- | ---------------------------- | -------------------------------------------------- |
| Build           | CRA / react-scripts          | **Vite 7**                                         |
| UI              | React 18                     | **React 19**                                       |
| Styling         | Tailwind 3 + custom CSS      | **Tailwind 4**                                     |
| Renderer state  | Redux Toolkit + Context      | **zustand**                                        |
| Persistence     | localforage (IndexedDB)      | **SQLite + Drizzle** (bun:sqlite, main process)    |
| Renderer ↔ data | direct (in-reducer)          | **typed RPC** (bun main ↔ webview)                 |
| Validation      | inline regex                 | **zod** + react-hook-form                          |
| Routing         | react-router 6               | **react-router 7** (hash router)                   |
| i18n            | none                         | **EN/MM** (template's `content.ts`, Myanmar-first) |
| Export          | react-to-print, dom-to-image | same (need to **verify** in webview)               |
| Packaging       | none (browser)               | Electrobun (tray, app menu, updater, installer)    |

## Key decision: images on disk, not base64

This is the headline change. From the Electrobun KB:

- **Write/read = plain Bun APIs** (`Bun.write`, `Bun.file`) in the main process. Electrobun has no fs wrapper of its own.
- Store user files under **`Utils.paths.userData`** (`~/Library/Application Support/<id>` on mac, `%LOCALAPPDATA%\<id>` on win, XDG on linux). The template already uses this dir for `app.db` + `backups`. Add an `images/` subdir (`mkdirSync(..., { recursive:true })`). **Never** write into the bundle/Resources — breaks code signing.
- **No documented `asset://` / custom protocol for arbitrary user files.** `views://` is bundle-only/read-only. `file://` as `<img src>` is not documented/guaranteed.
- So the supported path: **move bytes over RPC.**

Proposed flow:

```
upload:  webview <input type=file> → read bytes → rpc.saveImage({bytes, ext})
         bun: Bun.write(userData/images/<nanoid>.<ext>) → return relativePath
         store relativePath (string) in SQLite, NOT the bytes
display: rpc.getImage({path}) → bun: Bun.file(path).arrayBuffer() → bytes
         webview: URL.createObjectURL(new Blob([bytes])) → <img src>
```

Open concern: large blobs over RPC have marshalling overhead (KB flags it). For an invoice app (logos, small photos) probably fine; verify. Thumbnails could live in `Utils.paths.userCache`.

## Data model: SQLite instead of localforage

Old app had no real schema — JS objects in IndexedDB, invoices stored twice (a light list row + a full detail blob) to keep lists cheap. With SQL we get that for free via queries. Proposed tables (Drizzle, mirroring template conventions — text ids, `*_en`/`*_my` for bilingual, epoch-ms integers for dates):

- `company` (single row) — name, email, mobile, address, `logo_path`
- `clients` — name, email, mobile, billing_address, `image_path`
- `products` — name, product_id (SKU), amount, `image_path`
- `invoices` — invoice_no, status (1/2/3 → real enum/int), total_amount, currency, color, background_ref, due_date, created_date, client snapshot + company snapshot (FK or denormalized JSON — decide)
- `invoice_items` — invoice_id, name, product_id, amount, quantity
- `invoice_taxes` — invoice_id, title, type (`percentage`|`flat`), value, amount

The list screen becomes a `SELECT` (no second denormalized array). Status is a clean integer, not the old string `"1"/"2"/"3"`. Repositories + services + RPC handlers follow the template's DI pattern (`createXRepository(db)` → `createXService(repo)` → `createXHandlers(service)`), all unit-testable headlessly (`tdd` + `backend-e2e` skills).

## Core features to port (from the learning docs)

1. Company profile (single record) — header of every invoice.
2. Clients CRUD (list + search + pagination + quick add).
3. Products CRUD (reusable line items with price).
4. **Invoice builder** — the heart: line items, %/flat taxes, currency, color + background, Draft→Unpaid→Paid status lock, view/edit modes. See `workflow/learning/invoice-maker/guides/05-invoice-builder.md`.
5. Calculations — port `utils/match.js` pure functions ~as-is (subtotal, taxes, total, the no-round 2-decimal trick). Easy first TDD target.
6. Dashboard widgets — totals (balance, #clients, #products, #invoices).
7. Export — PDF (react-to-print) + image (dom-to-image), via the `isExporting` desktop-layout swap.

## What we reconsider / drop

- **Auth.** Template ships login/register/sessions. A single-user offline invoice app may not need it. **Decision needed** — likely drop the auth gate (or keep as optional app lock). Removing it simplifies routing (no ProtectedRoute/GuestOnly).
- **Background image catalog** (15 base64 JPEGs, ~10 MB). Don't embed in state. Either bundle as files served over `views://`, or ship a smaller set / let users pick their own. Decide.
- The old **in-reducer side-effect persistence** and **two-copy invoice** patterns disappear — replaced by RPC + SQL.
- Old custom CSS theme (`primary-self-text`, Josefin Sans) → Tailwind 4 tokens + the template's Khit Haung Burmese font.

## Open questions

- Auth: keep, drop, or make an optional local PIN/lock?
- Does `react-to-print` / `dom-to-image` work inside Electrobun's native webview? (Biggest technical risk — needs a spike.)
- Company/client snapshot on invoices: real FKs + join, or denormalized JSON column (the old app snapshotted company at save time so past invoices don't change)?
- Background images: bundle a curated set, or only user-supplied?
- Multi-currency formatting / number formatting — keep `react-number-format` or use `Intl`?
- Do we need invoice numbering automation (auto-increment per series)?

## Risks

- **Export in webview** — unverified; if broken, need a fallback (e.g. render-to-PDF in main via a headless approach). Spike early.
- **RPC image payload size** — verify acceptable for typical logos/photos.
- Scope: the invoice builder is ~1400 lines in the original. Largest single piece; plan it as its own phase.

## Recommendation

**Go.** Strong fit: the template already solves the hard desktop plumbing (SQLite, migrations, RPC, i18n, updater, packaging), and the invoice-maker learning docs give a clear functional target. The two genuine unknowns — export-in-webview and RPC image payloads — are spike-sized, not blockers.

**Next step:** run `/spec` to pin down scope (auth in/out, data model details, background-image strategy, export approach) → then `/plan-maker` to phase it. Suggested phase order: (1) scaffold + rename + strip auth, (2) data model + repos/services/RPC, (3) calculations (TDD), (4) clients/products/company CRUD, (5) invoice builder, (6) image-on-disk pipeline, (7) export spike + wire, (8) dashboard + i18n polish.

---

Source of _what to build_: `workflow/learning/invoice-maker/`. Source of _how_: `apps/electrobun-template` + `workflow/learning/electron-bun/`. Drafted 2026-05-24.
