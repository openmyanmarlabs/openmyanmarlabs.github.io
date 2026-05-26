# Plan 016 — Invoice UX Fixes 3

Source: `workflow/specs/2026-05-25-invoice-ux-fixes-3.md`

## Summary

Fixes the background-image bug (SVG URLs fail in `views://` protocol → re-import as `?raw` data URIs). Hardens all invoice document labels to hardcoded English (bypasses i18n). Removes the `max-w-3xl` width cap. Swaps the app-bar glyph for the real icon PNG. Makes edit/view mode visually obvious via a segmented icon-button pair. Adds inline client creation inside the selector modal. Consolidates export into a single dropdown button inside the toolbar.

All 5 phases are parallel-safe — no shared files.

## Phases

| #   | Phase                               | File                                          | Blocked by | Parallel-safe with |
| --- | ----------------------------------- | --------------------------------------------- | ---------- | ------------------ |
| 01  | Background data-URI fix             | `plans/todo/016-01-background-data-uri.md`    | —          | 02 03 04 05        |
| 02  | English doc labels + full width     | `plans/todo/016-02-doc-labels-full-width.md`  | —          | 01 03 04 05        |
| 03  | App bar PNG icon                    | `plans/todo/016-03-app-bar-icon.md`           | —          | 01 02 04 05        |
| 04  | Inline client creation              | `plans/todo/016-04-inline-client-creation.md` | —          | 01 02 03 05        |
| 05  | Toolbar revamp (edit/view + export) | `plans/todo/016-05-toolbar-revamp.md`         | —          | 01 02 03 04        |

## Notes / risks

- **Background root cause**: `base: "./"` in `vite.config.ts` produces relative asset URLs for SVG imports. In Electrobun's `views://` protocol, these relative file URLs can't be fetched by `html-to-image`. Switching to `?raw` + `encodeURIComponent` data URIs makes backgrounds self-contained — no external resolution ever.
- **Phase 02 — label scope**: only the DOCUMENT-INTERNAL labels listed in the spec are hardcoded. UI chrome (buttons, toasts, placeholders) stays bilingual via `useT()`. Don't remove `useT()` / `b` from any component — they still serve the remaining UI strings.
- **Phase 04 — inline form depth**: keep the mini-form minimal (name, email, phone). No image upload. Don't reuse the full `ClientForm` (it's heavyweight with image picker); write a lightweight inline form with just the 3 fields.
- **Phase 05 — row-menu pattern**: use the portal pattern from `src/components/common/row-menu.tsx` for the export dropdown to avoid z-index clipping inside the sticky toolbar.
- **Manual verify**: after all phases ship, run the app and test: background selection → live preview update; export with background → PDF/image contains background; language toggle to Myanmar → document labels stay English; edit/view toggle → obvious visual change; "+ Add new client" → submit → auto-selected; Export dropdown → three items visible.
