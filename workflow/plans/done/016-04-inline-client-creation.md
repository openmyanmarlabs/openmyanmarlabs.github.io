# 016-04 — Inline client creation in selector modal

Plan: `016-root-<slug>.md` · Blocked by: — · Parallel-safe with: 01, 02, 03, 05

## Goal

Add a two-panel "Add new client" flow inside `ClientSelectorModal` — mini-form (name/email/phone), `clientApi.create` on submit, auto-selects the new client and closes.

## Context

- File to edit: `apps/open-myanmar-invoice/src/features/clients/components/client-selector-modal.tsx`
- Modal already uses `Modal` from `@/components/common/modal` (`size="md"`). Props interface (`open`, `onClose`, `onSelect`) must not change.
- `clientApi.create(input: ClientCreateDTO)` in `@/lib/rpc` — returns `Promise<ClientRow>`. `ClientCreateDTO = Omit<ClientRow, "id" | "createdAt">` (fields: `name`, `email`, `mobile`, `billingAddress`, `imagePath` — all optional except `name`).
- Validation: import `clientSchema` from `@/features/clients/validations/client-schema`. Schema covers `name`/`email`/`mobile`/`billingAddress`. Mini-form only registers `name`, `email`, `mobile` — pass `billingAddress: ""` to satisfy the resolver.
- Error messages in the schema are i18n keys (`"nameRequired"`, `"emailInvalid"`). Resolve via `useT()` → `t.clients.errors.nameRequired`, `t.clients.errors.emailInvalid`.
- `react-hook-form` + `zodResolver` pattern: already used in `client-form.tsx` (same feature folder) — follow that pattern.
- Existing `useEffect` on `open` resets `search`/`query`/`page`/`loaded` — add `setView("list")` there.
- Icon: `RiAddLine`, `RiArrowLeftLine` from `@remixicon/react` (already in the app).
- Tailwind v4 / utility classes — mirror the button row style of other rows in the modal (`rounded-xl px-3 py-2.5` etc.).

## Steps

- [ ] Add `view` state: `const [view, setView] = useState<"list" | "create">("list")`.
- [ ] In the `useEffect` that resets on `open`, add `setView("list")`.
- [ ] In the list view, after `<SearchInput …/>`, insert an "Add new client" button:
  ```tsx
  <button
    type="button"
    onClick={() => setView("create")}
    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-neutral-500 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
  >
    <RiAddLine className="size-4 shrink-0" />
    {t.clients.addNew}{" "}
    {/* or a hardcoded fallback if the key doesn't exist yet */}
  </button>
  ```
  Check whether `t.clients.addNew` (or equivalent) exists in `src/lib/i18n/content.ts`; if not, use a literal string and note it as an open item.
- [ ] Conditionally render: when `view === "list"` show search + add button + list/empty + pagination + hint. When `view === "create"` render the mini-form instead.
- [ ] Mini-form implementation inside `ClientSelectorModal`:
  - Add local state: `const [createError, setCreateError] = useState<string | null>(null)`.
  - Set up `useForm<ClientFormValues>` with `zodResolver(clientSchema)` and `defaultValues: { name: "", email: "", mobile: "", billingAddress: "" }`.
  - Render back link: `<button type="button" onClick={() => { setView("list"); setCreateError(null); reset(); }}><RiArrowLeftLine /> Back to list</button>`.
  - Render three `<input>` (or reuse `Input` from `@/components/ui/input`) fields: `name` (required), `email` (type="email"), `mobile`.
  - Show field errors via `errors.name?.message` — resolve through `t.clients.errors[key]` if the key is an i18n key.
  - Submit handler: call `await clientApi.create({ name, email: email || null, mobile: mobile || null, billingAddress: null, imagePath: null })`. On success: `onSelect(newClient); onClose()`. On error: `setCreateError(String(err))`.
  - Submit button shows "Adding…" (`isSubmitting`) / "Add client" and is `disabled` while submitting.
  - Show `createError` as inline error text below the submit button.
- [ ] No changes to `ClientSelectorModalProps` interface, `Modal` wrapper, or any other file.
- [ ] Verify TypeScript compiles without errors (`bunx tsc --noEmit` or equivalent).

## Open items

- Confirm `t.clients.addNew` (or nearest equivalent) exists in `src/lib/i18n/content.ts`; if absent, either add the key to the content file or use a literal. Adding the i18n key is preferred — requires touching `src/lib/i18n/content.ts` as well.

## Done when

- List view shows "＋ Add new client" button below the search bar.
- Clicking it switches to the mini-form with name (required), email, phone fields.
- Submitting a valid name calls `clientApi.create`, then fires `onSelect(newClient)` and `onClose()`.
- Validation errors shown inline (name required, invalid email).
- Loading/disabled state while submitting.
- "← Back to list" link resets to the search panel.
- `ClientSelectorModalProps` interface unchanged.
- TypeScript compiles clean.

## Touches

- `apps/open-myanmar-invoice/src/features/clients/components/client-selector-modal.tsx` — add `view` state, "Add new client" button, inline mini-form panel.
- `apps/open-myanmar-invoice/src/lib/i18n/content.ts` — add `addNew` key to `clients` section (if missing).
