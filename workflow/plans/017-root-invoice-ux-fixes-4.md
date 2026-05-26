# Plan 017 — Invoice UX Fixes & Features Wave 4

Source: `workflow/specs/2026-05-25-invoice-ux-fixes-4.md`

## Summary

Fix two bugs (broken export, invisible due date in view mode), upgrade the color picker
(react-colorful swatches + interactive) and date picker (react-day-picker v9 popover),
tighten seven Burmese labels, polish the "Choose Client" button, and add an inline
name+price product quick-add inside the product-selector modal.

Five phases: three independent (export fix, labels+button, color picker), then date
picker unblocked by the color picker install (shared package.json), then inline product
create unblocked after labels land in content.ts.

## Phases

| #   | Phase                         | File                                         | Blocked by | Parallel-safe with |
| --- | ----------------------------- | -------------------------------------------- | ---------- | ------------------ |
| 01  | Export bug fix                | `plans/todo/017-01-export-fix.md`            | —          | 02, 03             |
| 02  | Labels + Choose Client button | `plans/todo/017-02-labels-choose-client.md`  | —          | 01, 03             |
| 03  | Color picker upgrade          | `plans/todo/017-03-color-picker.md`          | —          | 01, 02             |
| 04  | Date picker + due date fix    | `plans/todo/017-04-date-picker.md`           | 03         | 05                 |
| 05  | Inline product quick-add      | `plans/todo/017-05-inline-product-create.md` | 02         | 04                 |

## Notes / risks

- **Export timeout (most likely root cause)**: `maxRequestTime: 5000` in
  `src/bun/rpc/app-rpc.ts:56`. html-to-image rasterizing a 794px @2x invoice with
  background + logo can exceed 5 s. Increase the limit before investigating further.
- **Blob: URL in html-to-image**: the company logo is served as a `blob:` URL from
  `useImageObjectUrl`. html-to-image may fail to inline blob: URLs from within Electrobun's
  renderer. Phase 01 must test with and without a logo.
- **Phase 03/04 package.json conflict**: phases 03 and 04 both install libraries. Phase 04
  is blocked by 03 so they run in sequence — do not run concurrently.
- **Phase 02/05 content.ts conflict**: phase 05 adds new keys to content.ts; phase 02
  modifies existing keys. Phase 05 is blocked by 02 so content.ts is settled before new
  keys land.
- **Manual verify needed**: native-GUI acceptance (actual export to Finder, calendar
  popover feel, swatch preview) cannot be automated. Run the `verify` skill after all
  phases complete.
- **react-day-picker v9 CSS**: do NOT import its default CSS. Style via `classNames` prop
  with Tailwind utility classes only (light-only, no dark-mode).
