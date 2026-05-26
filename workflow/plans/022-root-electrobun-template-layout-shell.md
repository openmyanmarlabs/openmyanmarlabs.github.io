# Plan 022 — Electrobun Template Layout Shell

Source: `workflow/specs/2026-05-26-electrobun-template-layout-shell.md`

## Summary

Ports the invoice app's sidebar + AppBar shell into electrobun-template, replacing the flat horizontal navbar. Adds devtools auto-open in dev mode. Enriches the about page with version/links/update-check. Result: a full desktop app shell pattern future apps can fork from.

Four phases: store+i18n and devtools are independent first-wave work; layout shell and about page build on the store/i18n in parallel.

## Phases

| #   | Phase             | File                                | Blocked by | Parallel-safe with |
| --- | ----------------- | ----------------------------------- | ---------- | ------------------ |
| 01  | Devtools dev mode | `plans/todo/022-01-devtools.md`     | —          | 02                 |
| 02  | Store + i18n      | `plans/todo/022-02-store-i18n.md`   | —          | 01                 |
| 03  | Layout shell      | `plans/todo/022-03-layout-shell.md` | 02         | 04                 |
| 04  | About page        | `plans/todo/022-04-about-page.md`   | 02         | 03                 |

## Notes / risks

- Template has no existing store test files — Phase 02 adds the first ones; confirm `bun test` runs cleanly before handing off to Phase 03/04.
- `@remixicon/react` not in template's `package.json` — Phase 03 installs it; Phases 01/02 don't need it.
- Invoice's `app-bar.tsx` only has LanguageToggle on the right; template adds ThemeToggle + username + logout — AppBar will be wider; verify it doesn't wrap on small windows.
- `about-page.tsx` in Phase 04 extends `content.ts` (about section labels) on top of Phase 02's nav additions — executor must read current `content.ts` state before extending to avoid clobbering.
- Manual verify needed after all phases ship: relaunch persistence (sidebar collapse survives restart), no FOUC on theme, login/register pages show no sidebar.
