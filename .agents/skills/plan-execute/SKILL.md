---
name: plan-execute
description: >-
  Execute a phased plan produced by plan-maker: take a plan root file (or plan
  id), walk its phase table, and build the phases in dependency order —
  fanning out parallel-safe phases concurrently and running blocked phases in
  sequence — moving each finished phase from plans/todo to plans/done. This skill
  IMPLEMENTS (writes real code), unlike plan-maker which only plans. Use this
  whenever the user wants to execute/run/build/ship a plan: phrases like "execute
  plan 001", "build the plan", "run the phases in plans/todo", "implement this
  plan", "carry out the plan", or when they point at a <id>-root-<slug>.md and
  ask to make it happen. Reach for it even if they don't say "execute" — the
  trigger is the intent to turn a finished plan into working code. It runs
  autonomously through the waves but stops on a failed phase rather than building
  on a broken foundation.
---

# Plan Execute

Turn a finished plan (from `plan-maker`) into working code. Read the root file's phase table, resolve the dependency graph, and build the phases in order — parallel where the plan says it's safe, sequential where a phase is blocked.

This is the build counterpart to `plan-maker`. `plan-maker` plans and stops; **this skill writes real code.** Treat the phase files as the spec.

## Step 1 — Resolve the plan

Input is a plan root file path or a plan id (`001`). Find the root: `workflow/plans/<id>-root-*.md`. Read it.

Parse the phase table — each row gives: number, phase name, file, **Blocked by**, **Parallel-safe with**. Resolve each phase file in `workflow/plans/todo/<id>-NN-*.md`.

**Re-run safety:** a phase whose file is already in `workflow/plans/done/` is finished — skip it, treat it as a satisfied dependency. This makes execution resumable: if a prior run stopped halfway, running again picks up the remaining phases.

## Step 2 — Build the wave order

From the dependency graph, group phases into **waves**:

- A phase is **runnable** when every phase in its _Blocked by_ list is done (in `done/` or completed earlier this run).
- A wave = all currently-runnable phases that are mutually parallel-safe.
- After a wave finishes, newly-unblocked phases form the next wave.

**Trust but verify parallelism.** The _Parallel-safe with_ column is the plan author's claim. Before running two phases concurrently, sanity-check their **Touches** lists (in the phase files) — if two "parallel-safe" phases actually write the same file, they're not safe; serialize them. Catching this prevents two agents clobbering each other (e.g. both editing `package.json`).

## Step 3 — Execute, wave by wave

Run autonomously — don't pause for permission between waves. For each wave:

- Spawn one `plan-executor` subagent **per phase**, all in the same turn so parallel-safe phases run concurrently. Each executor gets one phase file and implements it.
- The subagent runs in isolation and can't see this conversation — pass it everything: the phase file path, the repo root, the plan id, and any cross-phase facts it needs (e.g. "phase 01 created the package.json you'll add a dep to").
- A single-phase wave is just one executor.

See the `plan-executor` agent for what each executor does. If that custom agent type isn't available yet (created mid-session), fall back to a `general-purpose` agent pointed at `.claude/agents/plan-executor.md`.

## Step 4 — After each phase: verify, then advance state

When an executor reports back:

1. **Verify the phase's _Done when_** criteria where checkable — run the build/tests it specified. Don't take "done" on faith if there's a cheap way to confirm.
2. **On success:** move the phase file `workflow/plans/todo/<id>-NN-*.md` → `workflow/plans/done/`. The todo/done split _is_ the progress tracker; keep it accurate so a re-run knows what's left.
3. **On failure:** STOP. Do not start phases that depend on the failed one — building on a broken foundation wastes work and corrupts later phases. Report what failed and why, what's done so far, and how to resume. It's fine to let already-running parallel siblings in the same wave finish first.

## Step 5 — Final report

When all reachable phases are done (or you stopped on a failure), tell the user:

- Phases completed + moved to `done/`.
- Anything that failed or got skipped, with the reason.
- The state of the build — does it run / do tests pass?
- Concrete next step (resume command, a phase that needs a human decision, etc.).

Keep it concise and clipped per the repo doc convention (see root `CLAUDE.md`).

## What you do NOT do

- Don't re-plan. If a phase is wrong or under-specified, flag it for the user (or suggest re-running `plan-maker`) rather than silently improvising a different design.
- Don't touch files outside a phase's declared _Touches_ scope without flagging it — that's how parallel phases collide.
