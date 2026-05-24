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

**Electrobun work → consult the local docs.** If the build touches Electrobun (desktop app, `electrobun.config`, CLI, browser windows/webviews, bundling/distribution, code-signing, updates, tray/menus, IPC/events…), spawn the `electrobun-docs-reader` subagent to pull the exact API/guide reference from the local KB (`workflow/learning/electron-bun/`) — ground phases in real signatures, don't guess or fetch online. Ask it specific questions (e.g. "BrowserWindow constructor options + how to load a view?"). Fan out several in one turn for independent topics. Cite the KB file paths it returns in the relevant phase's **Context** so executors can read them cold.

**Tailwind v4 work → consult the local docs.** If the build touches Tailwind CSS v4 (install with `@tailwindcss/vite`, CSS-first config / `@theme`, directives like `@utility`/`@custom-variant`/`@apply`/`@reference`/`@source`, functions `--alpha()`/`--spacing()`, content detection, dark mode, custom styles), spawn the `tailwind-docs-reader` subagent to pull exact v4 syntax from the local KB (`workflow/learning/tailwind/`) — v4 is CSS-first and syntax-sensitive, so ground phases in real directives, don't guess or fetch online. Ask it specific questions (e.g. "how to register the Vite plugin + import Tailwind in CSS?"). Cite the KB file paths it returns in the relevant phase's **Context**. **And in any phase that does Tailwind work, write an explicit instruction in its Steps/Context telling the executor to consult the `tailwind-docs-reader` subagent before writing CSS** — so the executor uses verbatim v4 syntax instead of guessing.

## Step 2 — Decompose into phases

Break the work into ordered phases. Good phases are:

- **Vertical where possible** — a phase delivers something checkable, not just "set up types".
- **Self-contained** — a phase file carries enough context to be executed without re-reading the whole spec.
- **Dependency-honest** — capture what each phase is _blocked by_ (must finish first) and what it's _parallel-safe with_ (disjoint files / no shared state, runnable concurrently).

Aim for the natural number of phases, not a target count. A small feature might be 2–3; a large one 6–8. If you're past ~8, the slices are probably too thin — merge some.

**Testable logic → plan it test-first (TDD).** When a phase delivers logic with a clear input→output contract — Bun services, Drizzle repositories, zod schemas, token/crypto/format utilities, pure store transitions — fold testing into that phase per the `tdd` skill (`.agent/skills/tdd/SKILL.md`), don't bolt it on. Concretely:

- The phase's **Steps** drive a red→green→refactor loop, one behavior at a time (`bun test`, co-located `*.test.ts`) — not "then write tests" at the end.
- The phase's **Done when** lists the behaviors that must be green, so "tested" is part of the acceptance bar, not optional.
- **No separate trailing "testing" phase.** A phase that writes all the tests after the code is the exact anti-pattern TDD avoids — tests belong with the behavior they describe, so they're written against real (not imagined) interfaces and the phase is independently verifiable.
- `plan-executor` can't invoke skills, so in any such phase **point the executor at `.agent/skills/tdd/SKILL.md` in its Context** (same move as the Tailwind callout) — that's how it picks up the repo's patterns cold (in-memory SQLite + DI, and _don't_ import `migrate.ts` in tests — it boots the Electrobun runtime).
- UI / RPC / Electrobun-runtime / startup glue isn't unit-tested — say so in that phase (verified by running the app), so the executor doesn't waste effort mocking the un-mockable.

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

For a phase that builds testable logic, fold the TDD expectation right into this template: write test-first **Steps** (red→green→refactor), list the green behaviors under **Done when**, add the `*.test.ts` files to **Touches**, and cite `.claude/skills/tdd/SKILL.md` in **Context** (see the TDD note in Step 2).

**Delegating phase writing:** for plans with several phases, you can fan out the file-writing to the `plan-writer` subagent — it runs in isolation, so pass it everything from your decomposition (phase title, id/number, blocked-by, parallel-safe-with, goal, context, steps, files). Phases that are parallel-safe can be written by parallel `plan-writer` agents in one turn. For a 2–3 phase plan, just write them inline; the subagent is for scale.

## Style

Every output `.md` follows this repo's doc convention: **concise, clipped, grammar traded for brevity** (see root `CLAUDE.md`). Bullets over prose. A plan nobody reads is dead weight.

## After writing

Tell the user:

- The root file path (where to start reviewing).
- The phase count + which phases are parallel-safe (so they see the critical path).
- That nothing's been executed — phases sit in `plans/todo/` for review; move to `plans/done/` as they ship.

Flag anything risky you noticed while planning (a hidden dependency, a shaky assumption in the spec) — catching it at plan time is the whole point.
