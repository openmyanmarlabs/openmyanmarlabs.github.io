# 017-05 — Inline product quick-add

Plan: `017-root-invoice-ux-fixes-4.md` · Blocked by: 02 · Parallel-safe with: 04

## Goal

Add a "+ New Product" affordance inside `ProductSelectorModal` — inline name+price mini-form; on save creates via `productApi.create` and refreshes the list so the new product is immediately clickable.

## Context

**Modal:** `apps/open-myanmar-invoice/src/features/products/components/product-selector-modal.tsx`

- Already imports `productApi` from `@/lib/rpc` and `useT` from `@/stores/i18n-store`.
- `fetchPage()` is a `useCallback` already defined — call it after create to refresh.
- Row click fires `onSelect(product); onClose()` — new product flows through the same path once it appears in the list.

**RPC:** `src/lib/rpc.ts` line 70: `productApi.create: (input: ProductCreateDTO) => bun().createProduct(input)`

**DTO:** `src/shared/types.ts` line 40:

```ts
export type ProductCreateDTO = Partial<Omit<ProductRow, "id" | "createdAt">> & {
  name: string;
};
```

`name` is required; all other fields optional. Pass `productId: ""` and `imagePath: null` for the quick-add path — no image, no SKU.

**i18n:** `src/lib/i18n/content.ts` — `my` is source of truth; `en` typed as `Content` (TS enforces symmetry). Phase 02 modifies existing keys in `content.ts`; this phase adds NEW keys under `products` in both sections. Must be done after phase 02 merges to avoid conflicts on that file.

**Icon:** `RiAddLine` from `@remixicon/react` (already a dep — used elsewhere in the codebase).

**Tailwind pattern in this modal:** `bg-neutral-100 rounded-xl px-3 py-2` — match for input fields.

## Steps

- [ ] **1. Add i18n keys** — in `src/lib/i18n/content.ts`, append 6 new flat keys to the `products` block in both `my` and `en` (after the existing `selectorHint` line is a natural insertion point):

  | key              | my                      | en              |
  | ---------------- | ----------------------- | --------------- |
  | `quickAdd`       | `"ပစ္စည်းအသစ် ထည့်မည်"` | `"New product"` |
  | `quickAddName`   | `"အမည်"`                | `"Name"`        |
  | `quickAddPrice`  | `"စျေးနှုန်း"`          | `"Price"`       |
  | `quickAddSubmit` | `"ထည့်မည်"`             | `"Add"`         |
  | `quickAddAdding` | `"ထည့်နေသည်…"`          | `"Adding…"`     |
  | `quickAddCancel` | `"ပယ်ဖျက်မည်"`          | `"Cancel"`      |

  Run `bun tsc --noEmit` (or the project's type-check command) to confirm symmetry — missing key in `en` is a compile error.

- [ ] **2. Add state to modal** — inside `ProductSelectorModal`, add:

  ```ts
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddName, setQuickAddName] = useState("");
  const [quickAddPrice, setQuickAddPrice] = useState("");
  const [quickAdding, setQuickAdding] = useState(false);
  ```

  Reset `showQuickAdd` to `false` inside the existing `useEffect` that runs on `open` (alongside the existing `setSearch("")` calls) so the form never leaks between modal opens.

- [ ] **3. "+ New Product" button** — render above the `<SearchInput>` when `!showQuickAdd`:

  ```tsx
  {
    !showQuickAdd && (
      <button
        type="button"
        onClick={() => setShowQuickAdd(true)}
        className="flex w-full items-center gap-2 rounded-xl border border-dashed border-neutral-300 px-3 py-2 text-sm text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700"
      >
        <RiAddLine className="size-4 shrink-0" />
        {t.products.quickAdd}
      </button>
    );
  }
  ```

- [ ] **4. Inline quick-add form** — render in place of the product list when `showQuickAdd` is true (above or replacing the `<ul>`):

  ```tsx
  {
    showQuickAdd && (
      <div className="flex flex-col gap-3 rounded-xl bg-neutral-50 p-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">
            {t.products.quickAddName}
          </label>
          <input
            type="text"
            value={quickAddName}
            onChange={(e) => setQuickAddName(e.target.value)}
            className="rounded-xl bg-neutral-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-300"
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">
            {t.products.quickAddPrice}
          </label>
          <input
            type="number"
            min="0"
            step="any"
            value={quickAddPrice}
            onChange={(e) => setQuickAddPrice(e.target.value)}
            className="rounded-xl bg-neutral-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-300"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleQuickAddSubmit}
            disabled={quickAdding}
            className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {quickAdding
              ? t.products.quickAddAdding
              : t.products.quickAddSubmit}
          </button>
          <button
            type="button"
            onClick={() => setShowQuickAdd(false)}
            disabled={quickAdding}
            className="rounded-xl px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
          >
            {t.products.quickAddCancel}
          </button>
        </div>
      </div>
    );
  }
  ```

- [ ] **5. Submit handler** — add `handleQuickAddSubmit` above the return:

  ```ts
  async function handleQuickAddSubmit() {
    const name = quickAddName.trim();
    const amount = Number(quickAddPrice);
    if (!name || isNaN(amount) || amount < 0) return;
    setQuickAdding(true);
    try {
      await productApi.create({ name, amount, productId: "", imagePath: null });
      setQuickAddName("");
      setQuickAddPrice("");
      setShowQuickAdd(false);
      setPage(1);
      setSearch("");
      setQuery("");
      // fetchPage() triggers via the useEffect that depends on [open, fetchPage];
      // but query/page reset may not re-trigger if values didn't change — call directly:
      await fetchPage();
    } finally {
      setQuickAdding(false);
    }
  }
  ```

  Note: after resetting `page`/`query` to their current values, `fetchPage` may not re-run via effect alone; calling it directly is the safe path.

- [ ] **6. Type-check** — `bun tsc --noEmit` must pass with no errors (i18n key symmetry, `ProductCreateDTO` shape, no implicit `any`).

- [ ] **7. Manual verify** — open invoice builder → "Add from products" → modal opens → click "+ New Product" → fill name + price → submit → spinner shows → form closes → refreshed list shows new product → click it → line item appended → modal closes.

## Done when

- "+ New Product" button visible in `ProductSelectorModal` above the search input
- Clicking opens inline name+price form; product list hidden while form is shown
- Submit: `productApi.create({ name, amount, productId: "", imagePath: null })` called; list refreshes; form resets and closes
- New product appears in the list and is clickable to add to invoice
- Cancel: form closes, list reappears, nothing created
- All 6 quick-add keys present under `products` in both `my` and `en`; `bun tsc --noEmit` passes

## Touches

- `apps/open-myanmar-invoice/src/features/products/components/product-selector-modal.tsx` — add state, button, inline form, submit handler
- `apps/open-myanmar-invoice/src/lib/i18n/content.ts` — add 6 `quickAdd*` keys under `products` in both `my` and `en`
