# 014-02 — Row-menu overflow fix (portal)

Plan: `014-root-invoice-ux-fixes-1.md` · Blocked by: — · Parallel-safe with: 01, 03, 04

## Goal

The row-action (⋮) menu opens fully on every row of the invoices, clients, and products tables — no longer clipped by the table card's `overflow-hidden`.

## Context

- Component: `apps/open-myanmar-invoice/src/components/common/row-menu.tsx`. Shared by all three lists:
  - `src/features/invoices/components/invoice-list.tsx`
  - `src/features/clients/components/client-list.tsx`
  - `src/features/products/components/product-list.tsx`
- Root cause: each list wraps rows in a card with `overflow-hidden rounded-2xl border …`. `RowMenu` renders its popover as an `absolute` child, so the card's `overflow-hidden` clips it (worse on the last/edge rows).
- Decision (spec open-question → resolved): **portal the popover** to `document.body` with fixed positioning, rather than removing `overflow-hidden` (which would also unclip the card's rounded corners / divide lines). Portal is robust against any ancestor clipping.
- Mechanism: keep the trigger button in place; on open, measure the trigger via `getBoundingClientRect()` and render the menu through `createPortal(…, document.body)` as `position: fixed` anchored to the trigger (right-aligned, just below). Keep existing behavior: click-outside + Esc close, `role="menu"`, the spring-in animation, danger styling.
- Close-on-scroll/resize: since it's fixed-positioned off a one-time measurement, also close the menu on window `scroll`/`resize` (cheap, avoids a detached floating menu). Click-outside must account for the portaled node (the existing `rootRef.contains` check won't see a portaled child — track the menu node too, or check both refs).
- Pure UI; not unit-tested (no logic contract) — verified by the manual walk in the root plan. Keep zero new deps (React `createPortal` from `react-dom`).

## Steps

- [ ] In `row-menu.tsx`, import `createPortal` from `react-dom`; add a ref to the trigger button.
- [ ] On open, compute fixed coords from the trigger's `getBoundingClientRect()` (right edge, top below the button); store in state.
- [ ] Render the popover via `createPortal(<menu style={{position:'fixed',…}} />, document.body)`; carry over the existing classes (drop `absolute right-0 top-full`; keep the rounded/shadow/animation classes) + a high `z-index`.
- [ ] Fix click-outside: treat clicks inside either the trigger root OR the portaled menu as "inside" (add a menu ref; check both before closing).
- [ ] Close the menu on window `scroll` + `resize` while open.
- [ ] Verify visually in all three lists (esp. last row): menu fully visible, click-outside + Esc still close, Edit/Delete still fire.

## Done when

- Opening ⋮ on the last/edge row of invoices, clients, and products shows the full menu (not clipped).
- Click-outside, Esc, scroll, and resize all close the menu; Edit/Delete actions still work.
- No new dependency added; `bun run typecheck` passes.

## Touches

- `apps/open-myanmar-invoice/src/components/common/row-menu.tsx` — portal the popover + positioning + close handlers.
- (Verify only, likely no edits) the three `*-list.tsx` files.
