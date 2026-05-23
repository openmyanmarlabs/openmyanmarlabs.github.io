## What this is

Open Myanmar Labs — open-source, bilingual (English + Burmese) apps for Myanmar. Monorepo.

## Tooling

- Runtime: **Bun** (also `npx` available)
- Auto-format: `.claude/settings.json` runs `bunx prettier --write` on every Write/Edit.

## Conventions

- **Docs: concise, short. Trade off grammar for brevity** — clipped phrasing over full sentences. Applies to this file and all READMEs/docs.

## Git

- Switch branches with `git switch` (not `git checkout`).
- Commit messages: Commitizen / Conventional Commits style — `type(scope): subject` (e.g. `feat(auth): add login`).
