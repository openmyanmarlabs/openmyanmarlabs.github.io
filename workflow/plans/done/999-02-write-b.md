# 999-02 — Write B

Plan: `999-root-sandbox-smoke.md` · Blocked by: — · Parallel-safe with: 01

## Goal

Create file B in the sandbox.

## Context

Pure filesystem. No deps. Runs concurrently with phase 01 (disjoint file).

## Steps

- [ ] `mkdir -p /tmp/plan-execute-vibe`
- [ ] Write `/tmp/plan-execute-vibe/b.txt` containing exactly: `beta`

## Done when

- `/tmp/plan-execute-vibe/b.txt` exists and reads `beta`.

## Touches

- `/tmp/plan-execute-vibe/b.txt` — new.
