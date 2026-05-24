# Plan 006 — Add Tailwind v4 to Electrobun template

Source: `workflow/specs/2026-05-24-add-tailwind-v4-electrobun-template.md`

## Summary

Adopt Tailwind v4 (CSS-first, `@tailwindcss/vite`) as the styling system of `apps/electrobun-template/`. Wire the Vite plugin + `@import "tailwindcss"`, define `@theme` font + blue brand tokens, declare class-strategy dark mode. Convert the example pages + language toggle to utilities (deleting the hand-written component CSS), then add a 3-state (light/dark/system) theme toggle with a no-FOUC head script. Each phase leaves the app building & rendering; verify end-to-end last.

## Phases

| #   | Phase                                   | File                                          | Blocked by | Parallel-safe with |
| --- | --------------------------------------- | --------------------------------------------- | ---------- | ------------------ |
| 01  | Install & wire Tailwind                 | `plans/todo/006-01-install-wire-tailwind.md`  | —          | —                  |
| 02  | Convert UI to utilities + dark variants | `plans/todo/006-02-convert-ui-utilities.md`   | 01         | —                  |
| 03  | Theme toggle + dark-mode state          | `plans/todo/006-03-theme-toggle-dark-mode.md` | 02         | —                  |
| 04  | Integration verify                      | `plans/todo/006-04-integration-verify.md`     | 03         | —                  |

**No parallel-safe phases.** The work is a sequential refactor of shared files (`global.css`, both pages) — honest critical path is 01 → 02 → 03 → 04. Linear but resumable: each phase keeps typecheck + build green, so a failure leaves the prior phase's working app intact.

## Notes / risks

- **Preflight not in local KB.** `@import "tailwindcss"` bundles Preflight (Tailwind's reset) per upstream docs, but the local KB doesn't document it. The plan removes the hand-written `*{}` reset on that basis — executor must confirm visual parity (Preflight sets `box-sizing:border-box`, zeroes margins, unstyles headings/lists). Ref: <https://tailwindcss.com/docs/preflight>
- **macOS baseline.** Tailwind v4 needs the system WebView ≥ Safari 16.4 (macOS 13+). Spec open question — assumed 13+. If older OS support is required, this conflicts.
- **Brand = blue.** `--color-brand-*` uses Tailwind's default blue oklch values; `brand-600` ≈ today's `#2563eb`, `brand-700` ≈ `#1d4ed8` — links keep their look.
- **`@font-face` stays top-level** (unlayered) per KB co-existence note; Myanmar-first rules move into `@layer base`.
- **Theme-toggle UX** = 3-state cycle button styled like the language pill (spec deferred the exact control shape; cycle button chosen for parity).
