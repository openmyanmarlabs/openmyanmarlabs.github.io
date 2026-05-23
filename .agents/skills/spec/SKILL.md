---
name: spec
description: >-
  Interview the user to produce a specification doc in workflow/specs/ — what to
  build, requirements, scope (in/out), constraints, acceptance criteria, open
  questions. Drives a relentless one-question-at-a-time interview (recommends an
  answer per question, explores the codebase instead of asking when it can),
  writing the spec incrementally as decisions lock. The output is the spec
  doc — no code. Use this whenever the user wants to spec something out, "write a
  spec", "let's nail down requirements", "turn this idea into a spec", pin down
  scope/constraints before building, or points at a workflow/ideas/ file and
  wants the next stage. Reach for it even if they don't say "spec" — the trigger
  is the intent to pin down WHAT to build before planning HOW. Comes after ideas,
  feeds plan-maker. Do NOT plan phases or implement here.
---

# Spec

Interview the user, write a **specification** to `workflow/specs/` — the contract for _what_ to build before anyone plans _how_. Output is the spec doc, nothing else.

## Why this exists

An idea is fuzzy; code is irreversible. A spec sits between: pins down scope, requirements, constraints, and what "done" means while changing them is still cheap. Specs feed [[plan-maker]] — a sharp spec makes a sharp plan; a vague one rots into rework. The interview is the work; the doc just records it.

## Mindset: interview, don't dictate

Behave like a relentless requirements interviewer. Walk each branch of the design tree, one decision at a time, resolving dependencies before moving on. **Don't implement, don't plan phases** — that's plan-maker's job. Stop at the spec.

## Step 1 — Find the input

- User points at `workflow/ideas/<x>.md` → read it, pre-fill, **only ask about gaps**. Don't re-ask what the idea already answers.
- From scratch → start at the goal question (below).
- Always skim the codebase to ground the spec — existing structure, conventions, what's net-new vs. already there. **Explore instead of asking** whenever the answer is in the repo.

## Step 2 — Interview, one question at a time

Ask **one** question, wait for the answer, then the next. Per question:

- **Recommend an answer** — your best guess + one-line why. The user confirms or corrects; cheaper than a blank prompt.
- **Explore over ask** — answerable from code/idea doc? Go look, don't ask.
- **Probe edges with scenarios** — stress-test fuzzy claims. "What happens offline mid-sync?" forces precision.
- **Sharpen vague terms** — "account" → Customer or User? Name it.

Walk the spec sections (Step 4) as branches. Stop when each is resolved or explicitly deferred to Open questions.

### Probe these dimensions (project-recurring)

This repo is **bilingual (EN + Burmese), offline-first, Bun monorepo**. Don't skip these unless clearly N/A:

- **i18n** — copy in both `en`/`my`? Myanmar-first default?
- **Offline** — works on-device? sync behavior when connection drops?
- **Scope guard** — what's explicitly _out_? (the most-skipped, most-valuable question)

## Step 3 — Write incrementally

Create the doc once the **goal** locks; fill sections as decisions crystallize — don't batch to the end. If interrupted, the spec already holds what's settled.

Path: `workflow/specs/YYYY-MM-DD-<slug>.md` (date via `date +%Y-%m-%d`; create folder if absent). Same-day collision → suffix `-HHMM`. Slug = kebab-case feature name.

## Step 4 — Spec structure

Maps 1:1 to what plan-maker extracts (goal, scope, requirements, constraints, non-goals). Use:

```markdown
# Spec — <Feature> (YYYY-MM-DD)

One-line: what this is.
Source: `workflow/ideas/<file>.md` (omit if from scratch)

## Goal

What gets built + the outcome it delivers. 2–3 lines.

## Users / context

Who uses it, when, where. Burmese-first? device/setting?

## Scope

**In:**

- Bullet — included.

**Out (non-goals):**

- Bullet — deliberately excluded. Guards against creep.

## Requirements

- [ ] Concrete, checkable must-have.
- [ ] Functional behavior, numbered if order matters.

## Constraints

- Tech / platform / perf / i18n / offline limits the build must respect.

## Acceptance — done when

- Observable criteria that prove the spec is met.

## Open questions

- Unresolved calls deferred — flag for plan time. Drop section if none.
```

Drop genuinely-empty sections — but **Goal, Scope, Requirements** are load-bearing; a spec without them hasn't done its job.

## Style

This repo's doc convention: **concise, clipped, grammar traded for brevity** (root `CLAUDE.md`). Bullets over prose. A spec nobody reads is dead weight.

## After writing

Tell the user:

- The spec path.
- Any **Open questions** still blocking — surface them; catching a gap now beats catching it mid-build.
- Next stage: `/plan-maker` turns this spec into a phased build plan. Offer it; don't run it unprompted.
