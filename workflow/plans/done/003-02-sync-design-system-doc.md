# 003-02 — Sync design-system reference doc

Plan: `003-root-english-heading-sans-font.md` · Blocked by: — · Parallel-safe with: 01

## Goal

The design-system source-of-truth doc describes the display font as Apple system sans, not serif Fraunces — so docs and code don't contradict.

## Context

`design-system/design-system-reference.md` is the documented source of truth (the landing `CLAUDE.md` points UI conventions at it). It currently claims a serif display font in two places:

- Line 3 — `… One sharp accent on lots of white; editorial serif headlines; calm, purposeful motion. …`
- Line 28 — `- **Display:** Fraunces (serif); italic = emphasis.`
- Line 34 — type-scale table row `| display | 56 | 600 (\`-0.02em\`) |` — **size/weight/tracking unchanged**, leave as-is.

Doc-only change. No code here (that's phase 01).

## Steps

- [ ] Line 3: replace `editorial serif headlines` with a sans description (e.g. `clean sans headlines` / `Apple-system sans headlines`).
- [ ] Line 28: replace `**Display:** Fraunces (serif); italic = emphasis.` with the sans reality — e.g. `**Display:** Apple system sans (-apple-system → SF Pro); same family as body, heavier weight.`
- [ ] Leave the type-scale table (line 34) unchanged — size 56 / weight 600 / `-0.02em` still hold.
- [ ] Scan the rest of the file for any other Fraunces/serif/italic-emphasis mention and update for consistency.

## Done when

- No mention of Fraunces or "serif" display headlines remains in `design-system-reference.md`.
- The Display typography entry reads as Apple-system sans.
- Type scale numbers (size/weight/tracking) are untouched.

## Touches

- `design-system/design-system-reference.md` — lines 3 + 28 (and any other serif/Fraunces references); table untouched.
