# Spec — Invoice UX Fixes & Features Wave 4 (2026-05-25)

UX fixes, UI upgrades, label rewrites, and one new feature for `@apps/open-myanmar-invoice`.
Source: `workflow/ideas/open-myanmar-invoice/fix-ux-4.md`

---

## Goal

Fix a broken export (PDF + image), upgrade the color picker and date picker to modern
components, surface the due date in all invoice view states, sharpen the "Choose Client"
button, rewrite several Burmese labels for clarity, and add inline product creation inside
the product-selector modal so users never need to leave the invoice builder.

---

## Users / context

Myanmar SMB operators building invoices in the Electrobun desktop app (macOS, light-only).
Myanmar-first UI; bilingual copy in `src/lib/i18n/content.ts` (`my` + `en` must stay in sync).
Offline-first — no network calls, everything via local SQLite + Bun.

---

## Scope

**In:**

- Fix export (PDF + PNG) returning "Could not export" error.
- Replace native `<input type="color">` in DesignModal with swatches-first + full interactive picker.
- Replace native `<input type="date">` in InvoiceDocument with a modern calendar popup.
- Fix due date display: value must be visible in view mode for Draft, Unpaid, Paid statuses.
- Make "Choose Client" button visually distinct (not a low-visibility ghost button).
- Update 7 Burmese label strings in `content.ts` (page titles + builder action labels).
- Add inline quick-add product form (name + price) inside `ProductSelectorModal`; on save, the new product is immediately selectable.

**Out (non-goals):**

- Sidebar route names — unchanged.
- English copy — only updated where the Burmese label change implies a matching EN update.
- Dark mode — app is light-only; no dark-mode work.
- Image upload in the inline quick-add product form (full form stays on Products page).
- SKU / productId field in the inline quick-add (name + price only).
- Any changes to invoice calculation, tax logic, or export byte format.
- Multi-color palettes or theming system beyond the single accent color.

---

## Requirements

### Bug: Export broken

- [ ] Diagnose root cause of "Could not export. Please try again" for both PDF and image kinds.
- [ ] Fix so that `runExport("pdf")` and `runExport("image")` succeed on a saved invoice in any status.
- [ ] Export toast shows success ("Downloads ဖိုလ်ဒါသို့ သိမ်းပြီးပါပြီ") and reveals the file in Finder.

### Bug: Due date invisible in view mode

- [ ] In view mode (all statuses), `wc.dueDate` must render via `formatDate()` when set.
- [ ] Shows the "No due date" fallback only when `dueDate` is genuinely null.
- [ ] Applies to Draft + Unpaid + Paid view states (not just the editor).

### UI: Color picker upgrade (DesignModal)

- [ ] Remove native `<input type="color">`.
- [ ] Add a curated flat swatch palette (≥ 16 colors: blues, indigos, teals, roses, ambers, greens, neutrals) rendered as a click-to-apply grid.
- [ ] Add an interactive gradient color picker below the swatches (library: `react-colorful`, `HexColorPicker` component) for custom colors.
- [ ] Hex text input remains (kept in sync with both swatches and picker).
- [ ] Live preview on the invoice updates immediately on each change.
- [ ] No dark-mode styling required.

### UI: Date picker upgrade (InvoiceDocument)

- [ ] Replace native `<input type="date">` with a popover calendar (library: `react-day-picker` v9).
- [ ] A styled trigger button shows the selected date or placeholder; clicking opens the popover.
- [ ] User can clear the date (sets `dueDate` to null).
- [ ] Popover closes on date selection or outside click.
- [ ] Only renders in edit mode (not read-only view); view mode continues showing `formatDate()` text.
- [ ] Library styled via Tailwind CSS classes (no CSS module imports).

### UI: "Choose Client" button

- [ ] Replace the ghost/sm Button with a visually distinct variant — e.g. outlined (border + brand color) or a filled secondary style.
- [ ] Still opens `ClientSelectorModal` on click; no behavioral change.
- [ ] Applies to `invoice-parties.tsx` edit mode only.

### Feature: Inline product quick-add in ProductSelectorModal

- [ ] A "+ New Product" button (or equivalent affordance) appears at the top or bottom of the modal list.
- [ ] Clicking it shows an inline mini-form with two fields: **Name** (required) and **Price** (required, non-negative number).
- [ ] On submit: calls `productApi.create`; the new product is immediately appended to/highlighted in the list; user can click it to add to the invoice without closing and reopening.
- [ ] On cancel: mini-form collapses, list returns to normal state.
- [ ] Name is required; price must be a valid non-negative number (reuses existing zod constraints from `productSchema`).
- [ ] Bilingual: quick-add button + form labels use `content.ts` keys (new keys added to `my` and `en`).

### UX: Label / text changes (`content.ts`)

All changes are Myanmar-language only unless the EN copy is also updated for symmetry.

| Location                 | Key                                | Old (my)                   | New (my)                                          |
| ------------------------ | ---------------------------------- | -------------------------- | ------------------------------------------------- |
| Client List page title   | `clients.title`                    | `ဖောက်သည်များ`             | `ကြိုတင်ထည့်ထားသော Client များ`                   |
| Product List page title  | `products.title`                   | `ပစ္စည်းများ`              | `ကြိုတင်ထည့်ထားသော ပစ္စည်း(သို့)ဝန်ဆောင်မှု များ` |
| Add from products button | `invoices.builder.addFromProducts` | `ပစ္စည်းမှ ထည့်မည်`        | `ကြိုတင်ပစ္စည်း(သို့)ဝန်ဆောင်မှု ထည့်မည်`         |
| Add blank row button     | `invoices.builder.addItem`         | `အတန်း ထည့်မည်`            | `Custom ပစ္စည်း(သို့)ဝန်ဆောင်မှု ထည့်မည်`         |
| Update to unpaid         | `invoices.builder.updateAsUnpaid`  | `မပေးချေရသေးဟု မွမ်းမံမည်` | `မပေးချေသေးသော Invoice ပြောင်းမည်`                |
| Update to paid           | `invoices.builder.updateAsPaid`    | `ပေးချေပြီးဟု မွမ်းမံမည်`  | `ငွေပေးချေပြီး Invoice ပြောင်းမည်`                |
| Save as draft            | `invoices.builder.saveAsDraft`     | `မူကြမ်းအဖြစ် သိမ်းမည်`    | `Draft Invoice အဖြစ်သိမ်းမည်`                     |

- [ ] All 7 `my` values updated.
- [ ] Matching `en` values updated for symmetry (plain English equivalents).
- [ ] `my` is the source of truth; `en: Content` typing catches any key mismatch at compile time.

---

## Constraints

- **Electrobun renderer** — Chromium WebView. No Node APIs in renderer; only `@/lib/rpc` calls for backend. `html-to-image` must still be the export mechanism.
- **react-colorful** — must be added as a production dependency (`bun add react-colorful`). No alternative native pickers.
- **react-day-picker v9** — must be added as a production dependency. Style only with Tailwind; do **not** import its default CSS.
- **Light-only** — no `dark:` class additions.
- **i18n symmetry** — `my` and `en` trees in `content.ts` must match exactly; TypeScript enforces this.
- **No image upload** in the inline quick-add form (image can be added from Products page later).
- **Working copy** — invoice builder uses a zustand `builder-store`; all state mutations go through the store's typed setters, not direct DOM manipulation.

---

## Acceptance — done when

- [ ] Exporting an invoice (any status) from the toolbar produces a file in Downloads and shows the success toast; no "Could not export" error.
- [ ] Design modal shows swatch grid + interactive `HexColorPicker`; picking either updates the invoice preview live.
- [ ] Date picker field in the invoice header opens a calendar popover on click; selected date updates the invoice; clearing sets it to null.
- [ ] Due date text is visible in view mode for a saved Draft, Unpaid, and Paid invoice.
- [ ] "Choose Client" button is visually prominent (not a ghost/text-only link).
- [ ] All 7 Burmese label strings are updated; `bun run check` (or TypeScript build) passes with no i18n key errors.
- [ ] "+ New Product" in the selector modal opens a name+price mini-form; submitting creates the product and makes it immediately selectable in the same modal session.

---

## Open questions

- **Export root cause** — unknown until investigation. Likely suspects: `html-to-image` CORS issue with blob: logo URLs, `exportStageRef.current` being null at capture time, or the RPC `exportApi.save` failing silently. Investigation is the first implementation step.
- **Date picker locale** — `react-day-picker` supports locale via `date-fns`. Burmese locale (`my`) is available in `date-fns/locale`; include it for month/weekday labels? Deferred to implementation; English/numeric is acceptable fallback.
- **Swatch palette** — exact hex values for the 16+ swatches not fixed here; implementor picks Tailwind-aligned colors (blue-600, indigo-600, teal-600, etc.).
