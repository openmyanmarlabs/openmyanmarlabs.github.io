# 017-02 — Labels + Choose Client button

Plan: `017-root-invoice-ux-fixes-4.md` · Blocked by: — · Parallel-safe with: 01, 03

## Goal

Update 7 Burmese/English i18n strings in `content.ts` and make the "Choose Client" button visually distinct (`variant="secondary"` instead of `"ghost"`).

## Context

- All bilingual copy: `apps/open-myanmar-invoice/src/lib/i18n/content.ts`
- `my` is the source of truth; `en: Content` is typed as `typeof my` — any key asymmetry is a compile error
- Sidebar nav keys (`nav.*`) are not touched
- "Choose Client" button: `apps/open-myanmar-invoice/src/features/invoices/components/invoice-parties.tsx` lines 69-77
- Button variants available: `"primary"` | `"secondary"` | `"ghost"` (see `apps/open-myanmar-invoice/src/components/ui/button.tsx`)
  - `secondary` → `bg-neutral-100` fill + brand-adjacent text; has visible background — reads clearly as an action
  - `ghost` → transparent; current state — blends in too much
- Current markup: `variant="ghost" size="sm" className="h-7 px-2"` — keep `size`, `className`, `onClick`, all other props; only change `variant`

## Steps

- [ ] Open `content.ts`; update 7 `my` values:

  | Key path                           | New `my` value                                    |
  | ---------------------------------- | ------------------------------------------------- |
  | `clients.title`                    | `ကြိုတင်ထည့်ထားသော Client များ`                   |
  | `products.title`                   | `ကြိုတင်ထည့်ထားသော ပစ္စည်း(သို့)ဝန်ဆောင်မှု များ` |
  | `invoices.builder.addFromProducts` | `ကြိုတင်ပစ္စည်း(သို့)ဝန်ဆောင်မှု ထည့်မည်`         |
  | `invoices.builder.addItem`         | `Custom ပစ္စည်း(သို့)ဝန်ဆောင်မှု ထည့်မည်`         |
  | `invoices.builder.updateAsUnpaid`  | `မပေးချေသေးသော Invoice ပြောင်းမည်`                |
  | `invoices.builder.updateAsPaid`    | `ငွေပေးချေပြီး Invoice ပြောင်းမည်`                |
  | `invoices.builder.saveAsDraft`     | `Draft Invoice အဖြစ်သိမ်းမည်`                     |

- [ ] Update matching 7 `en` values:

  | Key path                           | New `en` value                    |
  | ---------------------------------- | --------------------------------- |
  | `clients.title`                    | `"Pre-saved Clients"`             |
  | `products.title`                   | `"Pre-saved Products / Services"` |
  | `invoices.builder.addFromProducts` | `"Add pre-saved product/service"` |
  | `invoices.builder.addItem`         | `"Add custom product/service"`    |
  | `invoices.builder.updateAsUnpaid`  | `"Change to unpaid invoice"`      |
  | `invoices.builder.updateAsPaid`    | `"Change to paid invoice"`        |
  | `invoices.builder.saveAsDraft`     | `"Save as draft invoice"`         |

- [ ] Run `bun run typecheck` (or `bunx tsc --noEmit`) in the invoice app dir — confirm zero i18n key-symmetry errors
- [ ] In `invoice-parties.tsx` line 71, change `variant="ghost"` → `variant="secondary"`; leave all other props unchanged

## Done when

- All 7 `my` Burmese strings match the table above
- All 7 `en` strings match the table above
- `bun run typecheck` passes with no type errors
- "Choose Client" button renders with a filled/bordered background (`secondary` variant) — not transparent ghost

## Touches

- `apps/open-myanmar-invoice/src/lib/i18n/content.ts` — 7 `my` values + 7 `en` values updated
- `apps/open-myanmar-invoice/src/features/invoices/components/invoice-parties.tsx` — `variant="ghost"` → `variant="secondary"` on the Choose Client button
