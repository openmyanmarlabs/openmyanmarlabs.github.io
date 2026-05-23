# 999-01 — Write A

Plan: `999-root-sandbox-smoke.md` · Blocked by: — · Parallel-safe with: 02

## Goal

Create file A in the sandbox.

## Context

Pure filesystem. No deps. Runs concurrently with phase 02 (disjoint file).

## Steps

- [ ] `mkdir -p /tmp/plan-execute-vibe`
- [ ] Write `/tmp/plan-execute-vibe/a.txt` containing exactly: `alpha`

## Done when

- `/tmp/plan-execute-vibe/a.txt` exists and reads `alpha`.

## Touches

- `/tmp/plan-execute-vibe/a.txt` — new.
