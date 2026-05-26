# Spec — Invoice Advanced Filter + UX Fixes (2026-05-26)

One-line: Advanced invoice-list filtering (status + created/due date ranges) plus three smaller UX fixes — softer Burmese cancel wording, draft-first builder button gating, and a new About Us page.
Source: `workflow/ideas/open-myanmar-invoice/fix-ux-6.md`

App: `apps/open-myanmar-invoice` (Electrobun, React 19 renderer, bun main, SQLite/Drizzle). Bilingual EN/MY, offline, light-only.

## Goal

Make the invoice list filterable (status + created-date + due-date, alongside the existing invoice-no search), tighten two builder/i18n rough edges, and add an About Us page linking out to Open Myanmar Labs + the creator. All offline, bilingual, on-brand.

## Users / context

Single-user, offline desktop app, Myanmar-first. The list filter is the headline — users with many invoices need to slice by status/date. The cancel-wording, builder gating, and About page are smaller polish.

## Scope

### 1. Advanced invoice-list filter (major)

**In:**

- **Status filter** — a single-select segmented pill row, always visible above the list: All / Draft / Unpaid / Paid (statuses 1/2/3; "All" = no status filter). Default All. Styled like the reports period switcher.
- **Created-date range** + **Due-date range** — behind a "Filters" button → popover; each is a from/to pair reusing the `react-day-picker` popover pattern.
- **Invoice-number search** — the existing debounced search box stays; this IS the "By Invoice Number" filter. Keep it in the toolbar.
- **Active-filter chips** — created/due ranges render as removable chips below the toolbar (× clears that one); a "Clear all" shows when any filter (incl. non-All status) is active. The active status itself is reflected by the highlighted pill (no separate status chip needed).
- **Backend wiring** — extend `ListParamsDTO` + the repo `list()` where-clause:
  - `status?: number` → `eq(invoices.status, status)`.
  - created range already supported (`fromDate`/`toDate` on `createdDate`) — just wire the UI to it.
  - `dueFromDate?` / `dueToDate?` → `gte` / `lte` on `invoices.dueDate`. Rows with null `dueDate` are excluded when a due filter is active.
- All filters **AND** together; **server-side** (the list is paginated). Any filter change resets to page 1 (mirror the existing search reset).
- Empty-match state ("no matches" + Clear all).
- Filters live in the list store; survive in-session navigation; reset on app restart (not persisted to disk).
- Bilingual copy for all new controls.

**Out (non-goals):**

- Multi-select status (chose single-select).
- Overdue / preset due filters (chose due-date range).
- Saved/named filter presets; persisting filters across app restarts.
- Sort controls (stays newest-first).
- Search beyond invoice number (client name, amount, etc.).

### 2. Burmese cancel wording (minor i18n)

**In:** Replace all 6 occurrences of `ပယ်ဖျက်မည်` (the `cancel` / `quickAddCancel` keys — `content.ts` lines 75, 168, 227, 253, 339, 400) with **`မလုပ်တော့ပါ`** ("never mind").

**Out:** Delete-action wording (`ဖျက်မည်`) untouched — only Cancel/dismiss buttons change. English copy unchanged.

### 3. Builder edit/view button gating (minor) — existing drafts only

**In:** For an EXISTING DRAFT invoice (status 1, not new) in `builder-toolbar.tsx`, gate the buttons on `isViewMode`:

- EDIT mode (`!isViewMode`): show **Update Draft** (+ the view/edit toggle); HIDE **Change to Unpaid** / **Change to Paid**.
- VIEW mode (`isViewMode`): HIDE **Update Draft**; show the toggle + **Change to Unpaid** / **Change to Paid**.
- After **Update Draft** saves successfully → set view mode true (drop back to view), matching the existing status-transition save which already calls `setViewMode(true)`.

**Out:** New-invoice flow unchanged — Save as Draft / Unpaid / Paid stay directly available on create (one atomic save, no unsaved-edits risk). Unpaid (2) / Paid (3) invoices unchanged (already view-only; Paid hides the whole save bar).

### 4. About Us page (feature) — "Rich"

**In:**

- New route `/about` under `AppLayout`; sidebar nav link after Settings (a remix info icon, e.g. `RiInformationLine`), label "About" / "အကြောင်း".
- Content (bilingual EN/MY, Myanmar-first):
  - Open Myanmar Labs intro + purpose (open-source bilingual apps for Myanmar).
  - Website → `openmyanmarlabs.com`.
  - GitHub → `https://github.com/openmyanmarlabs/openmyanmarlabs.github.io`.
  - Creator: **Lwin Moe Paing** + Facebook `https://facebook.com/lwinmoepaing.dev`.
  - App name + **current version** (from the update system's running-version context).
  - **Check for updates** button — reuse the existing update store `check()` (same flow as the banner/menu); show inline result (up-to-date / update available → open the download via `openExternal`).
  - A short license/credits line.
- All external links open in the system browser via the existing `openExternal` RPC.
- Clean, on-brand layout (cards, light-only).

**Out (non-goals):**

- Auto-download/install of updates from About (check + link out only; installs go through the existing banner flow).
- Contributors list / changelog / duplicating "about" into Settings.

## Requirements

- [ ] Status pill row (All/Draft/Unpaid/Paid) filters server-side; default All; single-select; bilingual.
- [ ] "Filters" popover offers Created-date (from/to) + Due-date (from/to) using the existing day-picker pattern.
- [ ] Existing invoice-no search box retained + still debounced.
- [ ] `ListParamsDTO` + repo `list()` extended: `status`, `dueFromDate`, `dueToDate` (created `fromDate`/`toDate` reused); all AND together; null-due rows excluded when a due filter is set.
- [ ] Active date filters show as removable chips; per-chip clear + Clear-all; any filter change resets to page 1.
- [ ] Empty-match state renders with a Clear-all affordance.
- [ ] New repo filter logic covered by tests (status, created range, due range, combined) — extend the existing `invoice-repository` / handler tests.
- [ ] All 6 `ပယ်ဖျက်မည်` → `မလုပ်တော့ပါ`; no delete-action wording changed.
- [ ] Existing-draft builder: Update Draft only in edit mode; Change to Unpaid/Paid only in view mode; Update-Draft save flips to view mode. New / unpaid / paid flows unchanged.
- [ ] `/about` route + sidebar link (after Settings); page shows org intro/purpose, website, GitHub, creator + Facebook, app version, Check-for-updates, license line — all bilingual.
- [ ] All external links open via `openExternal` in the system browser.
- [ ] No TypeScript errors; existing tests pass.

## Constraints

- Filtering is **server-side** (Drizzle where-clause) — the list is paginated, so client-side filtering would break pagination + total counts.
- Status is integer (1 Draft / 2 Unpaid / 3 Paid); `statusKey()` (`features/invoices/lib/invoice-row.ts`) maps to `draft|unpaid|paid` labels.
- Dates are epoch-ms integers; day-picker selection → start-of-day / end-of-day bounds (reuse the reports export date math).
- Reuse existing patterns: `react-day-picker` popover (`due-date-picker` / reports range modal), the portal `Modal` / popover components, segmented-pill styling (reports period switcher), the `openExternal` RPC, and the update store `check()` + running-version context.
- Bilingual EN/MY, symmetric keys in `content.ts` (both trees must match or the inferred type breaks); Myanmar-first.
- Light-only; Tailwind v4 utilities; kebab-case files; feature-folder conventions.
- Builder gating must NOT regress the new-invoice or unpaid/paid flows — gate on `isViewMode` only for existing drafts.

## Acceptance — done when

- The invoice list shows a status pill row + search + Filters popover; picking a status / created range / due range narrows the list server-side, AND-combined, page resets to 1, chips reflect active date filters, Clear-all resets everything.
- A due-date range excludes invoices with no due date; an empty match shows the empty state.
- Burmese Cancel buttons read `မလုပ်တော့ပါ` everywhere; delete buttons still read `ဖျက်မည်`.
- Editing an existing draft shows only Update Draft (no status-change buttons); saving returns to view mode, where Update Draft is hidden and Change to Unpaid/Paid appear. A new invoice still offers Save as Draft / Unpaid / Paid.
- `/about` is reachable from the sidebar; all four links open in the system browser; the version line shows the running version; Check-for-updates runs the existing check; copy toggles EN/MY.
- Typecheck clean; tests (incl. new filter tests) green.

## Open questions

- **App-version source for About** — reuse the update system's running-version context (`update-store` `localVersion`, supplied by the bun version handler). Confirm that value is exposable to a non-update page; if not, add a tiny `getVersion` RPC. (Recommended: reuse the update context.)
- **Check-for-updates UX on About** — inline result text on the page vs reusing the update banner/modal. Recommend inline status text, deferring the actual install to the existing banner flow.
