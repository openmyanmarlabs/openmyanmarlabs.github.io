---
name: plan-maker
description: >-
  Turn an idea or specification markdown into a phased implementation plan — a
  root index (summary + phase table) plus one self-contained plan file per phase,
  written to workflow/plans/ for the user to review before any code is written.
  Works like Claude's plan mode (research + think deeply, propose, don't
  implement) but decomposes the work into ordered, dependency-aware phases that
  can be executed — or parallelized — one at a time later. Use this whenever the
  user wants to plan out a feature, "break this into phases", "make a plan from
  this spec/idea", "phase this out", turn a spec/idea doc into something
  buildable, or points at a file in workflow/ideas or workflow/specs and asks
  what the build looks like. Reach for it even if they don't say "plan" — the
  trigger is the intent to go from a spec/idea to a sequenced, reviewable build
  breakdown. Do NOT start implementing; this skill produces plan docs only.
---

# Plan Maker

Take an **idea** (`workflow/ideas/…`) or **spec** (`workflow/specs/…`) and produce a phased build plan: a root index plus one file per phase. The user reviews these _before_ execution — so the plan, not the code, is the deliverable here.

## Why this exists

A spec says _what_ to build; it doesn't say in what order, what blocks what, or what can run in parallel. Dumping a whole feature into one giant plan makes it un-reviewable and un-resumable. Splitting it into phases means each phase is small enough to review, hand to a fresh session, or fan out to parallel agents. The root table is the map; each phase file is a self-contained ticket someone can execute cold.

## Mindset: plan mode, not build mode

Behave like Claude's plan mode — read the input, explore the codebase as much as needed to ground the plan in reality, think the whole approach through. But **do not implement**. The output is markdown plan files. Stop there; the user executes (or has another session execute) the phases later.

## Step 1 — Read the input + ground it

1. Read the idea/spec markdown the user pointed at. Pull out: goal, scope, constraints, explicit requirements, non-goals.
2. Explore the codebase enough to plan honestly — existing structure, conventions, what already exists vs. what's net-new. Don't guess at file layouts you can check.
3. If the input is too thin to plan from (no clear goal, contradictory scope), ask the user one or two sharp questions rather than inventing requirements.

## Step 2 — Decompose into phases

Break the work into ordered phases. Good phases are:

- **Vertical where possible** — a phase delivers something checkable, not just "set up types".
- **Self-contained** — a phase file carries enough context to be executed without re-reading the whole spec.
- **Dependency-honest** — capture what each phase is _blocked by_ (must finish first) and what it's _parallel-safe with_ (disjoint files / no shared state, runnable concurrently).

Aim for the natural number of phases, not a target count. A small feature might be 2–3; a large one 6–8. If you're past ~8, the slices are probably too thin — merge some.

## Step 3 — Assign the plan id

One id is shared by a plan's root + all its phases. Sequential, zero-padded to 3 digits. Compute the next id by scanning existing roots:

```bash
ls workflow/plans/*-root-*.md 2>/dev/null | sed -E 's@.*/([0-9]+)-root-.*@\1@' | sort -n | tail -1
```

Increment that (or start at `001` if none). Phases within the plan number `01`, `02`, … . Slugs are kebab-case: the root slug names the whole plan (`001-root-user-auth.md`); each phase slug names that phase (`001-02-session-tokens.md`).

## Step 4 — Write the root index

Save to `workflow/plans/<id>-root-<slug>.md`. This is the map. Use this structure:

```markdown
# Plan <id> — <Plan title>

Source: `workflow/specs/<file>.md` (or ideas/…)

## Summary

2–4 lines: what gets built, the shape of the approach.

## Phases

| #   | Phase   | File                           | Blocked by | Parallel-safe with |
| --- | ------- | ------------------------------ | ---------- | ------------------ |
| 01  | <phase> | `plans/todo/<id>-01-<slug>.md` | —          | 02                 |
| 02  | <phase> | `plans/todo/<id>-02-<slug>.md` | —          | 01                 |
| 03  | <phase> | `plans/todo/<id>-03-<slug>.md` | 01, 02     | —                  |

## Notes / risks

- Open decisions, assumptions, things to confirm before building.
```

## Step 5 — Write each phase file

Save to `workflow/plans/todo/<id>-NN-<slug>.md`. Each is a standalone ticket:

```markdown
# <id>-NN — <Phase title>

Plan: `<id>-root-<slug>.md` · Blocked by: <NN or —> · Parallel-safe with: <NN or —>

## Goal

One line: what this phase delivers.

## Context

What the executor needs to know — relevant files, existing patterns to follow, decisions already made. Enough to start cold.

## Steps

- [ ] Concrete task.
- [ ] Next task.

## Done when

- Checkable acceptance criteria.

## Touches

- `path/to/file` — what changes.
```

**Delegating phase writing:** for plans with several phases, you can fan out the file-writing to the `plan-writer` subagent — it runs in isolation, so pass it everything from your decomposition (phase title, id/number, blocked-by, parallel-safe-with, goal, context, steps, files). Phases that are parallel-safe can be written by parallel `plan-writer` agents in one turn. For a 2–3 phase plan, just write them inline; the subagent is for scale.

## Style

Every output `.md` follows this repo's doc convention: **concise, clipped, grammar traded for brevity** (see root `CLAUDE.md`). Bullets over prose. A plan nobody reads is dead weight.

## After writing

Tell the user:

- The root file path (where to start reviewing).
- The phase count + which phases are parallel-safe (so they see the critical path).
- That nothing's been executed — phases sit in `plans/todo/` for review; move to `plans/done/` as they ship.

Flag anything risky you noticed while planning (a hidden dependency, a shaky assumption in the spec) — catching it at plan time is the whole point.
