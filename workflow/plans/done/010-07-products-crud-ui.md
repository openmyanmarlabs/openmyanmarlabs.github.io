# 010-07 — Products CRUD UI + selector modal

Plan: `010-root-open-myanmar-invoice.md` · Blocked by: 04 · Parallel-safe with: 05, 06

## Goal

`/products` screen mirroring clients: list (search + pagination 10/page), inline create, edit modal, delete confirm — each product with an on-disk image. Plus a reusable **product selector modal** (6/page) the builder appends as a line item.

## Context

- **`frontend-design`**; **consult `tailwind-docs-reader` before writing CSS** (Tailwind v4). Reuse `src/components/ui/*` and the same table/modal/pagination patterns as clients (06) — if 06 lands first, factor shared table/pagination bits into `src/components/common/` rather than duplicating; if parallel, keep self-contained and reconcile later.
- Functional ref: `workflow/learning/invoice-maker/guides/08-ui-patterns.md`. Fields: name, `product_id` (SKU), amount (price — format via `src/lib/money.ts` from 05), image_path.
- Backend from 04: product CRUD + search + paginated list RPC; image pipeline helper.
- Forms: zod + react-hook-form (`src/features/products/validations/`).
- **Selector modal:** searchable, 6/page; on select the builder appends the product as a new line (qty 1, amount = product price). Export it for phase 08.
- i18n: append `products` namespace to `content.ts` (en/my symmetric). Route + navbar — **append only** (shared with 05/06).

## Steps

- [ ] Consult `tailwind-docs-reader`; build `/products` list (search + pagination + empty state).
- [ ] Create/edit/delete wired to RPC; image upload/preview via pipeline.
- [ ] Build + export the reusable **product selector modal** (searchable, 6/page, returns selection).
- [ ] zod validations; price display via `formatMoney`; i18n keys (en/my); route + navbar (append-only).
- [ ] Manual check (**`run`/`verify`**): CRUD persists; images render; selector returns a product.

## Done when

- Products CRUD + search + pagination persist to SQLite; images on disk render back.
- Reusable product selector modal exported and works standalone (builder will import it).
- EN/MM symmetric; route + nav present; typecheck clean.

## Touches

- `src/features/products/**` — list, forms, validations, **selector modal (exported)**, api.
- `src/components/common/` — shared table/pagination bits (if factored from 06).
- `src/lib/i18n/content.ts`, `src/routes/index.tsx`, `src/components/common/navbar.tsx` — **append only**.
