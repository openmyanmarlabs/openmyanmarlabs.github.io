# Plan 014 — Open Myanmar Invoice UX Fixes (round 1)

Source: `workflow/specs/2026-05-25-invoice-ux-fixes-1.md`

## Summary

Five UX fixes for `apps/open-myanmar-invoice`, split into 4 phases. Money formatting becomes `1,000 MMK` (suffix, English digits, all currencies) — a TDD'd change to the single `money.ts`. Dark mode is removed (light-only). The top nav becomes a collapsible left sidebar + slim app bar (remix-icon), and page content is unified to `max-w-5xl`. The row-action (⋮) menu is portaled so table `overflow-hidden` no longer clips it.

## Phases

| #   | Phase                              | File                                     | Blocked by | Parallel-safe with |
| --- | ---------------------------------- | ---------------------------------------- | ---------- | ------------------ |
| 01  | Money format (TDD)                 | `plans/todo/014-01-money-format.md`      | —          | 02, 03, 04         |
| 02  | Row-menu overflow fix (portal)     | `plans/todo/014-02-row-menu-overflow.md` | —          | 01, 03, 04         |
| 03  | Light-only (remove dark mode)      | `plans/todo/014-03-light-only.md`        | —          | 01, 02             |
| 04  | Sidebar shell + remix-icon + width | `plans/todo/014-04-sidebar-shell.md`     | 03         | 01, 02             |

Critical path: **03 → 04**. Phases 01, 02, 03 can all start concurrently; 04 follows 03 (both rewrite `navbar.tsx`).

## Notes / risks

- **Dark variant is class-based** (`global.css:10` — `@custom-variant dark (&:where(.dark, .dark *))`). So dormant `dark:` utility classes never activate once `.dark` is never applied — even under OS dark mode. Phase 03 just removes the FOUC script + theme store/toggle; it does **not** touch the `dark:` classes (per spec).
- **`navbar.tsx` is the contested file** — edited by 03 (drop ThemeToggle, stay compiling) then rewritten by 04 (nav → app bar + sidebar). Hence 04 is blocked by 03. Each phase leaves the app compiling + runnable on its own.
- **No backend-e2e (L1) gate** — these are frontend + a pure util; no new RPC → service → DB feature. Coverage is unit-level: `money.ts` and the sidebar collapse store are TDD'd (L0). No handler/transport changes.
- **remix-icon** = `@remixicon/react` (React component set); phase 04 adds it. Used only for the new sidebar/app-bar surfaces — existing inline SVGs stay.
- **Open (from spec, confirm at build):**
  - _Overflow mechanism_ — plan picks the **portal** approach (robust vs. any ancestor clipping) over dropping `overflow-hidden`.
  - _App-bar logo asset_ — phase 04 assumes reuse of an existing logo/icon in `public/`; confirm the exact file.
- **Manual `verify`-skill walk (can't be automated)** after 03 + 04 ship:
  - App launches light; OS dark mode has no effect; no dark flash (FOUC) on load.
  - PDF / invoice export renders light-colored.
  - Money reads `1,250,000 MMK` (English digits) on dashboard, invoice list/builder/summary, product list/selector, client list.
  - App bar = logo + title + collapse toggle + language toggle; all route links live in the sidebar; active route highlighted.
  - Sidebar collapses/expands; collapsed state survives an app relaunch.
  - Page content is wider + consistent across pages.
  - ⋮ menu on the last/edge row of each list opens fully (not cut off).
