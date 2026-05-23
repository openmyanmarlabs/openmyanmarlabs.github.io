# 999-03 — Combine

Plan: `999-root-sandbox-smoke.md` · Blocked by: 01, 02 · Parallel-safe with: —

## Goal

Combine A + B into one file. Proves the blocked-phase gate (must run after 01 and 02 finish).

## Context

Depends on outputs of phase 01 (`a.txt`) and 02 (`b.txt`). Cannot start until both exist.

## Steps

- [ ] Read `/tmp/plan-execute-vibe/a.txt` and `/tmp/plan-execute-vibe/b.txt`.
- [ ] Write `/tmp/plan-execute-vibe/combined.txt` = a + newline + b.

## Done when

- `/tmp/plan-execute-vibe/combined.txt` reads exactly:
  ```
  alpha
  beta
  ```

## Touches

- `/tmp/plan-execute-vibe/combined.txt` — new.
