---
name: handoff
description: >-
  Write a session continuation doc (a "handoff") capturing the current state of
  work — what's done, what's in progress, the concrete next steps, open
  questions, and the key files — so the next Claude session (or the user
  themselves) can resume without re-deriving context. Saves to
  workflow/handoffs/YYYY-MM-DD-handoff.md. Use this whenever the user is wrapping
  up a work session or wants to preserve context: phrases like "hand off", "save
  where we are", "I'm stopping for today", "create a handoff", "continuation
  doc", "context for next time", "so I can pick this up later", or when a session
  with unfinished work is clearly ending. Reach for it even if the user doesn't
  say the exact word "handoff" — the trigger is the intent to checkpoint and
  resume later.
---

# Handoff

Capture the live state of a work session into a doc the _next_ session can read cold and immediately continue. The reader has none of your current context — they did not see this conversation. Write for that person.

## Why this exists

Context is lost between sessions. Without a handoff, the next session re-discovers the goal, re-reads the same files, and re-asks questions the user already answered. A good handoff collapses that ramp-up to a single read. Optimize for _resumability_, not for a complete record — include what someone needs to act, skip what they can re-derive from the code.

## Gather state first

Pull from these sources, richest first:

1. **This conversation** — the primary source. What was the goal? What got done? What's half-finished? What decisions did the user make, and what did they reject? What's the obvious next move?
2. **Git, if this is a repo** — run these to ground the doc in reality rather than memory:
   - `git status --short` — uncommitted work in flight
   - `git diff --stat` — what changed and how much
   - `git log --oneline -10` — recent commits for context
   - `git branch --show-current` — branch to resume on
     If it's not a git repo, skip silently — don't fabricate.
3. **The task/todo list**, if one is active — open items are next steps.

Don't interrogate the user. Infer from what you have; only ask if a genuinely critical fact is missing (e.g. there's no clear "next step" anywhere).

## Write the doc

Save to `workflow/handoffs/YYYY-MM-DD-handoff.md` (get the date with `date +%Y-%m-%d`; create the folder if absent). If a file for today already exists, suffix with time: `YYYY-MM-DD-HHMM-handoff.md` — never overwrite a prior handoff, the history is the point.

Match this repo's doc style: **concise, clipped, grammar traded for brevity** (see root `CLAUDE.md`). Bullets over paragraphs. A handoff nobody reads is useless, and walls of prose don't get read.

Use this structure:

```markdown
# Handoff — YYYY-MM-DD

## Goal

One line: what this work is ultimately for.

## Resume here

The single next action, concrete enough to start immediately. If you read nothing else, do this.

## Done this session

- Shipped X.
- Decided Y (because Z).

## In progress

- Thing started, current state, where it's parked. Half-written file, failing test, etc.

## Next steps

- [ ] Concrete action.
- [ ] Another, in rough priority order.

## Open questions

- Unresolved decisions, blockers, things needing the user's call.

## Key files

- `path/to/file` — why it matters / what's in flight there.
```

Drop any section that's genuinely empty rather than padding it — but `Goal`, `Resume here`, and `Next steps` are the load-bearing ones; a handoff without them hasn't done its job.

## After writing

Tell the user the path, and give a one-line summary of what the next session should do first. If you noticed something that _should_ be a next step but the user might not expect (a lurking bug, a risky assumption), flag it explicitly — surfacing it now is the whole value of a handoff.
