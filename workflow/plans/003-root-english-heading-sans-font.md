# Plan 003 — English headings: serif → Apple-system sans

Source: `workflow/specs/2026-05-24-english-heading-sans-font.md`

## Summary

Swap the English display font from serif Fraunces to the Apple system sans stack — a token-only value change so all 8 `var(--font-display)` call sites stay untouched. Strip serif fallbacks (kills the Times New Roman fallback), remove Fraunces from the Google Fonts link, and sync the design-system doc. Burmese headings unchanged.

## Phases

| #   | Phase                                | File                                             | Blocked by | Parallel-safe with |
| --- | ------------------------------------ | ------------------------------------------------ | ---------- | ------------------ |
| 01  | Swap display font to sans (CSS+HTML) | `plans/todo/003-01-swap-display-font-to-sans.md` | —          | 02                 |
| 02  | Sync design-system reference doc     | `plans/todo/003-02-sync-design-system-doc.md`    | —          | 01                 |

Both phases touch disjoint files → run them concurrently. Phase 01 is the whole observable change; Phase 02 is doc sync.

## Notes / risks

- **Token name stays `--font-display`** though it now holds a sans value (spec constraint — avoids churning 8 call sites). Slight misnomer; deliberate. DRY option: set `--font-display: var(--font-sans)`.
- Don't touch the Burmese heading rules in `global.css` (`:lang(my)` / `[lang="my"]`) — they must keep leading with `--font-myanmar`.
- When editing the `index.html` Google Fonts `<link>`, **keep `Noto Sans Myanmar`** — only remove the `Fraunces:...&` segment.
- Verify with network throttled / Google Fonts blocked: no serif should ever appear, and no Fraunces request in DevTools Network.
