# 010-08 — Invoice builder UI (+ color + backgrounds)

Plan: `010-root-open-myanmar-invoice.md` · Blocked by: 03, 04, 06, 07 · Parallel-safe with: —

## Goal

The heart of the app: `/invoices/new` + `/invoices/:id` builder — line items, %/flat taxes, client + company on the invoice, status flow with edit-lock, color + background, save handshake persisting via RPC. Largest phase; budget accordingly.

## Context

- Functional spec (read it): `workflow/learning/invoice-maker/guides/05-invoice-builder.md`. Re-implement the **behavior**, not the old Redux/effect code.
- **`frontend-design`** for the invoice layout; **consult `tailwind-docs-reader` before writing CSS** (Tailwind v4). The rendered invoice is also the export target (phase 09) — build a clean `#invoice-wrapper` DOM with an `isExporting` fixed-width desktop layout swap (spec §Export).
- Reuse: client selector modal (from 06) + product selector modal (from 07); calc module `src/lib/calc/invoice-math.ts` (from 03); money formatter `src/lib/money.ts` (from 05); image helper `src/lib/images.ts`.
- Backend from 04: invoice create/get/update/delete RPC; numbering suggestion; snapshots assembled server-side (builder sends client_id + chosen background + items/taxes + status; service snapshots company/client).
- **Builder behavior:**
  - New (`/invoices/new`): fetch suggested `invoice_no` (editable), `created_date` = now, start editable, default color + default background applied.
  - Existing (`/invoices/:id`): load detail, open **view-only**, restore color/background.
  - Line items: add blank row (qty 1, amount 1) or append via product selector. Inline validation: quantity `/^\d+$/`, amount `/^[0-9]\d*(\.\d+)?$/`, both > 0. Any change → recompute subtotal → re-apply % tax → total (via calc module). Delete row → recompute.
  - Taxes: add % (max 1 — refuse 2nd with toast, per calc module) or flat (unlimited); inline validate (`0 < v ≤ 100` for %, `v > 0` for flat); delete → recompute.
  - Client: pick via selector (sets client_id; service snapshots) or edit fields inline.
  - Status: 1 Draft (fully editable) / 2 Unpaid (read-only) / 3 Paid (terminal, read-only, action bar hidden). **Edit allowed only when Draft** — else toast "edit only in Draft" (i18n).
  - Save handshake: choose target status → confirm modal → on confirm RPC persist → new: navigate to `/invoices`; existing: back to view mode. Success toast.
  - Currency: format all money via `formatMoney` (app-wide `default_currency`); no per-invoice picker.
- **Color + backgrounds:**
  - Color picker (hex), default applied to new invoices; stored on the invoice (`color`).
  - **Curated backgrounds = Vite assets** (KB-confirmed): place ~6–8 images under `src/features/invoices/backgrounds/` and **import them as ES modules** (`import bg1 from "./backgrounds/bg1.jpg"`) so Vite rewrites URLs in dev and `post-build.ts` copies them into the bundle for prod. Reference these as `builtin:<id>` in `background_ref`; resolve id→imported-URL via a small registry map. Do NOT hand-write `views://` strings.
  - User-supplied background: upload via image pipeline (04) → `file:<path>` → render via `getImage` blob URL.
- Builder state: zustand store or local state + a thin working-copy model. If any non-trivial pure transition logic emerges (e.g. recompute orchestration), **TDD it** per `.claude/skills/tdd/SKILL.md` (keep it in a pure module). UI itself isn't unit-tested (verified by running).
- i18n: append an `invoices`/`builder` namespace to `content.ts` (en/my symmetric). Route + navbar — append only.

## Steps

- [ ] Consult `tailwind-docs-reader`; build the invoice DOM (`#invoice-wrapper`) + `isExporting` layout swap.
- [ ] New vs existing init (numbering suggestion, defaults, view-only-on-load for existing).
- [ ] Line items: add/append (product selector)/edit/delete with inline validation + live recompute via calc module.
- [ ] Taxes: %/flat add/edit/delete with validation + recompute; refuse 2nd %.
- [ ] Client pick (selector) / inline edit; company shown from current settings.
- [ ] Status flow + edit-lock + toasts; save handshake (confirm modal → RPC persist → navigate/view).
- [ ] Color picker + curated backgrounds (imported assets + registry) + user-supplied background (pipeline).
- [ ] i18n keys (en/my); route + navbar (append-only).
- [ ] Manual check (**`run`/`verify`**): create + edit an invoice end to end; totals match calc; status lock works; backgrounds (builtin + user) apply; reload persists.

## Done when

- Create + edit invoices with items + % + flat taxes; totals match the phase-03 calc exactly.
- Status flows Draft→Unpaid→Paid with edit locked outside Draft; save handshake persists via RPC.
- Built-in (imported asset) + user-supplied background both apply and render; color persists.
- Snapshots verified: editing a client afterward leaves the saved invoice unchanged (already covered server-side in 04; confirm via UI).
- Typecheck clean; any extracted pure logic green under `bun test`.

## Touches

- `src/features/invoices/**` — builder page, item/tax rows, status + save UI, color/background picker, backgrounds/ assets + registry, builder store/working-copy (+ `*.test.ts` if pure logic extracted).
- `src/lib/i18n/content.ts`, `src/routes/index.tsx`, `src/components/common/navbar.tsx` — append only.
