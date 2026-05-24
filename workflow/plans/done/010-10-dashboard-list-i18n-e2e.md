# 010-10 — Dashboard + invoice list + i18n polish + L1 e2e gate

Plan: `010-root-open-myanmar-invoice.md` · Blocked by: 04, 05, 06, 07, 08 · Parallel-safe with: 09

## Goal

The home dashboard (widgets + recent invoices), the invoice list screen (single SELECT), an EN/MM i18n sweep across all screens, and the L1 backend-e2e gate proving the assembled main-process stack works.

## Context

- **Dashboard** (`/`): widgets — total balance (Σ `total_amount`), #clients, #products, #invoices — all via SQL counts/sums exposed from the invoice/dashboard service (04). Recent invoices (latest N). No Lottie (non-goal). Format money via `src/lib/money.ts`.
- **Invoice list** (`/invoices`): a **single SELECT** of invoice rows (no second denormalized array — that's the whole point vs the old app). Search + pagination (10/page), status pills (Draft/Unpaid/Paid), row actions Detail (→ builder `/invoices/:id`) + Delete (confirm → RPC cascade delete). Reuse the table/pagination bits from 06/07.
- **`frontend-design`** for dashboard/list; **consult `tailwind-docs-reader` before CSS** (Tailwind v4).
- **i18n sweep:** verify `src/lib/i18n/content.ts` `en`/`my` are symmetric across every namespace the feature phases appended (settings, clients, products, invoices, dashboard); Myanmar-first default; Burmese font (template's Khit Haung) renders. Fix any missing/asymmetric keys (TS will flag asymmetry via `en: Content = typeof my`).
- **L1 backend-e2e gate** — read `.claude/skills/backend-e2e/SKILL.md`. This is the one legitimate end-of-feature test step: exercise the REAL assembled path **RPC handler map → service → repository → in-memory SQLite** (transport-free seam from 04), minus the native window + wire. Cover the headline vertical flows:
  - create company → create client + product → build invoice (items + % + flat tax) → totals correct (match calc) → persisted + retrievable via the single-SELECT list.
  - snapshot immutability across the assembled stack: save invoice → edit client → re-fetch invoice detail → unchanged.
  - numbering increments across sequential invoice creates.
  - cascade: delete invoice → items/taxes gone.
  - image saveImage→getImage round-trip (path-safe).
  - `bun test` green; **do not import `migrate.ts`** (in-memory schema setup instead).

## Steps

- [ ] Consult `tailwind-docs-reader`; build dashboard widgets (counts/sums via service) + recent invoices.
- [ ] Build `/invoices` list (single SELECT) with search, pagination, status pills, Detail/Delete.
- [ ] Wire delete (confirm → cascade RPC); link Detail → builder.
- [ ] i18n sweep: ensure symmetry + Myanmar-first across all namespaces; fix gaps; verify Burmese font.
- [ ] Write the L1 `backend-e2e` suite over the assembled handler→service→repo→SQLite stack (flows above).
- [ ] **`verify` (manual native-GUI walk):** relaunch → data persists, no FOUC, EN↔MM toggle clean, dashboard totals correct, list opens builder, delete works.

## Done when

- Dashboard shows correct total balance + counts + recent invoices.
- Invoice list is a single SELECT with working search/pagination/status/detail/delete.
- EN/MM symmetric with no missing keys; default Myanmar; Burmese font renders.
- L1 `backend-e2e` suite green under `bun test` (vertical flows + snapshot + numbering + cascade + image round-trip).
- Manual `verify` walk passes (record results).

## Touches

- `src/features/dashboard/**` — widgets + recent invoices.
- `src/features/invoices/**` — list screen (+ reuse table/pagination).
- `src/bun/**/*.e2e.test.ts` (or per skill convention) — L1 suite.
- `src/lib/i18n/content.ts` — symmetry fixes.
- `src/routes/index.tsx`, `src/components/common/navbar.tsx` — dashboard/list routes (append).
