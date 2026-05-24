# 010-06 — Clients CRUD UI + selector modal

Plan: `010-root-open-myanmar-invoice.md` · Blocked by: 04 · Parallel-safe with: 05, 07

## Goal

`/clients` screen: list with search + pagination (10/page), inline create, edit modal, delete confirm — each client carrying an on-disk image. Plus a reusable searchable **client selector modal** (6/page) the invoice builder (08) consumes.

## Context

- **`frontend-design`** for the screen; **consult `tailwind-docs-reader` before writing CSS** (Tailwind v4). Reuse `src/components/ui/*` primitives.
- Functional ref: `workflow/learning/invoice-maker/guides/08-ui-patterns.md` (table = flex divs, responsive card rows on mobile; `react-paginate`-style pagination; kebab row menu Detail/Delete; empty state). You may use the template's existing patterns instead of porting old deps — keep it within the template stack.
- Backend from 04: client CRUD + search + paginated list RPC; `saveImage`/`getImage` + `src/lib/images.ts` for images.
- Forms: zod + react-hook-form (`src/features/clients/validations/`). Fields: name, email, mobile, billing_address, image_path.
- **Selector modal** is the reusable piece for the builder: searchable (filter), paginated 6/page, returns the chosen client. Export it from the clients feature so phase 08 imports it. Keep its data-fetch via the same client RPC.
- Local list state via a small zustand store or component state; no Redux.
- i18n: append a `clients` namespace to `content.ts` (en/my symmetric). Route + navbar entry — **append only** (shared with 05/07).

## Steps

- [ ] Consult `tailwind-docs-reader`; build `/clients` list (search + pagination + empty state).
- [ ] Create (inline form), edit (modal), delete (confirm) wired to RPC; optimistic or refetch.
- [ ] Image upload/preview via the image pipeline helper.
- [ ] Build + export the reusable **client selector modal** (searchable, 6/page, returns selection).
- [ ] zod validations; i18n keys (en/my); route + navbar (append-only).
- [ ] Manual check (**`run`/`verify`**): CRUD persists across relaunch; images render from disk; selector returns a client.

## Done when

- Clients list/search/paginate/create/edit/delete all persist to SQLite; images on disk render back.
- Reusable client selector modal exported and works standalone (the builder will import it).
- EN/MM symmetric; route + nav present; typecheck clean.

## Touches

- `src/features/clients/**` — list, forms, validations, **selector modal (exported)**, api.
- `src/lib/i18n/content.ts`, `src/routes/index.tsx`, `src/components/common/navbar.tsx` — **append only**.
