# 010-05 — Company profile + settings UI

Plan: `010-root-open-myanmar-invoice.md` · Blocked by: 04 · Parallel-safe with: 06, 07

## Goal

A `/settings` (or `/company`) screen to view + edit the single company record (name, email, mobile, address, logo) plus app settings (`default_currency`, `invoice_prefix`), with the logo stored on disk via the image pipeline.

## Context

- Build with **`frontend-design`** for polish. **Before writing any CSS, consult the `tailwind-docs-reader` subagent** for exact Tailwind v4 syntax (template is v4, CSS-first). Reuse template UI primitives: `src/components/ui/{button,input,select,text}.tsx`.
- Backend ready from 04: company get/upsert RPC + `saveImage`/`getImage`. Use the renderer image helper `src/lib/images.ts` (blob-URL from bytes).
- Forms: template ships **zod + react-hook-form** — validate with a zod schema (`src/features/company/validations/`). Currency: a `<select>` of supported codes; `Intl.NumberFormat` formatting helper (shared, used app-wide) keyed on `default_currency` — create `src/lib/money.ts` (single source of truth for money formatting; builder + dashboard reuse it).
- i18n: add a `settings`/`company` namespace to `src/lib/i18n/content.ts` — **append only your keys**, keep `en`/`my` symmetric (Myanmar-first). Use `useT()`.
- Routing: add the route in `src/routes/index.tsx` under `AppLayout` and a nav entry (`src/components/common/navbar.tsx`). **Append only** — this file is shared with 06/07.
- Feature folder: `src/features/company/` (pages, components, validations, `company-api.ts` thin RPC wrapper if not already in `lib/rpc.ts`).

## Steps

- [ ] Consult `tailwind-docs-reader`; scaffold `src/features/company/` page + form.
- [ ] zod schema + react-hook-form for company fields + settings; load current via RPC, save via upsert.
- [ ] Logo upload: `<input type=file>` → bytes → `saveImage` → store returned path; preview via `getImage` → blob URL.
- [ ] Create `src/lib/money.ts` (`formatMoney(amount, currency)` via `Intl.NumberFormat`).
- [ ] Add i18n keys (en/my); add route + navbar entry (append-only).
- [ ] Manual check via **`run`/`verify`**: edit + save persists across relaunch; logo renders from disk.

## Done when

- Company + settings load, edit, and persist to SQLite; logo saved under `userData/images/` and re-rendered from disk (no base64).
- `formatMoney` exists and reflects `default_currency`.
- EN/MM keys symmetric; route + nav present; typecheck clean.

## Touches

- `src/features/company/**` — page, form, validations, api.
- `src/lib/money.ts` — shared money formatter (new).
- `src/lib/i18n/content.ts`, `src/routes/index.tsx`, `src/components/common/navbar.tsx` — **append only**.
