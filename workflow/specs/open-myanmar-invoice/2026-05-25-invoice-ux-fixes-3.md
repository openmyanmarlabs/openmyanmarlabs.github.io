# Spec — Invoice UX Fixes 3 (2026-05-25)

Background-image fix, English-only document labels, full-width invoice, app-bar icon, edit/view mode revamp, inline client creation, export grouping.
Source: `workflow/ideas/open-myanmar-invoice/fix-ux-3.md`

## Goal

Fix a critical bug where Design-modal background selection does nothing (preview and export both broken). Harden the invoice document to always show professional English labels regardless of app language. Widen the invoice card, update the app-bar icon, and revamp edit vs view mode to make the distinction obvious. Add inline client creation inside the selector modal so users never leave the invoice builder to add a client.

## Users / context

Myanmar business owners creating invoices on the Electrobun desktop app. Invoice PDFs/images are shared with clients — they must look professional with English labels. App shell UI stays bilingual (my/en). Users are non-technical; the edit/view distinction must be self-evident at a glance.

## Scope

**In:**

- Background-image bug fix (live preview + export both broken)
- Invoice document labels hardcoded English — bypass i18n toggle
- Specific label text: Invoice No · Due Date · From · Bill To · Description · QTY · RATE · AMOUNT · Add % tax · Add fee · Subtotal · Total
- Invoice card width: full container (remove `max-w-3xl` cap in editor mode)
- App bar: replace `RiBillFill` glyph placeholder with actual Electrobun app icon PNG
- Edit vs View mode revamp — frontend-design skill decides visual treatment; must be obvious without explanation
- Client selector modal: inline "Add new client" flow (frontend-design skill designs the UX); creates client, auto-selects, closes modal
- New client form minimum fields: name (required), email, phone
- Export: grouped under single Export button with icon; items = Export PDF · Export Image · Export Excel (disabled, "Coming soon")
- Toolbar UX: reorganize Back / View-Edit toggle / Design / Export / status-save buttons — frontend-design skill decides final layout

**Out (non-goals):**

- Excel export actual implementation
- Dark mode
- Backend schema changes
- New invoice statuses or workflow states
- Bilingual content outside the invoice document itself
- Upload-custom-background feature

## Requirements

- [ ] Selecting any builtin background in Design modal immediately updates the live invoice preview
- [ ] Exported PDF/image includes the selected background
- [ ] Invoice document labels are hardcoded English strings in component source — not read from `useT()` / `content.ts`; unaffected by lang toggle
- [ ] Label text exactly matches: "Invoice No" · "Due Date" · "From" · "Bill To" · "Description" · "QTY" · "RATE" · "AMOUNT" · "Add % tax" · "Add fee" · "Subtotal" · "Total"
- [ ] Invoice card editor width spans the full container (no `max-w-3xl` cap; export path still uses fixed 794px)
- [ ] App bar logo is the app's real icon PNG (from `icon.iconset`) not a remix icon glyph
- [ ] Edit mode and View mode are visually distinct without tooltip or label — discoverable at a glance
- [ ] Client selector modal has an "Add new client" affordance
- [ ] Submitting new client from the modal: persists via `clientApi.create`, auto-selects the new client, closes the modal
- [ ] Export actions grouped as a dropdown/button with an icon; shows PDF, Image, and disabled "Excel (Coming soon)"
- [ ] Toolbar actions logically grouped per frontend-design skill output

## Constraints

- Light-only (dark-mode CSS classes present but inactive per plan 014-03)
- Electrobun desktop, `views://` protocol — Vite-emitted asset URLs must resolve at runtime (root cause of the background bug is likely this)
- App UI bilingual (my/en); only invoice document labels are hardcoded English
- No runtime network access; all assets local
- Stack: Bun, React, Zustand, Tailwind v4, Remixicon, `html-to-image`, `pdf-lib`
- Feature phases append keys to `content.ts`; document labels bypass `content.ts` entirely

## Acceptance — done when

- Selecting a builtin background → invoice card background updates immediately in the editor view
- Exporting an invoice with a selected background → PDF/image contains the background
- Toggle app language to Myanmar, open invoice builder → all document-internal labels still show in English
- Invoice card in edit/view page spans the full content container width (not capped at ~768px)
- App bar logo is the actual icon PNG, not a colored tile with a glyph
- Switching Edit ↔ View produces a clear, obvious visual state change
- Client selector modal: clicking "Add new client" → submit form → new client auto-selected → modal closed
- Export button opens dropdown with PDF · Image · Excel (Coming soon, disabled)
