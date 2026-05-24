# 005-01 — Scaffold + toolchain

Plan: `005-root-electrobun-react-template.md` · Blocked by: — · Parallel-safe with: —

## Goal

Create `apps/electrobun-template/` with its own git repo, `package.json` (all deps), `tsconfig.json`, `.gitignore`, and a placeholder `README.md`. `bun install` succeeds. This is the foundation phases 02 + 03 build on.

## Context

- Lives at `apps/electrobun-template/` — **drop-zone**: each app owns its own `git init`; parent monorepo ignores `apps/*` (see root `.gitignore`). Not a submodule — just an independent repo.
- Versions mirror `landing/package.json` (already in repo): React `^19.2`, react-dom `^19.2`, `@types/react` `^19.2`, `@types/react-dom` `^19.2`, `@vitejs/plugin-react` `^5`, vite `^7`, typescript `^6`. Add: `electrobun` (latest), `react-router` (v7 — single package), `@types/bun` (devDep, for the bun process).
- `tsconfig.json` mirrors `landing/tsconfig.json` (ES2022, bundler resolution, `jsx: react-jsx`, strict, `verbatimModuleSyntax`) but `include` must cover both `src/bun` and `src/main-ui`.
- Kebab-case all files/folders per `apps/CLAUDE.md`.
- Prettier auto-formats on Write (parent `.claude/settings.json`).

## Steps

- [ ] `mkdir -p apps/electrobun-template/src/{bun,main-ui}` and `apps/electrobun-template/scripts`.
- [ ] Write `package.json`: `name: "@openmyanmarlabs/electrobun-template"`, `private: true`, `type: "module"`. Scripts: `"start": "bun run scripts/dev.ts"`, `"dev": "bun run scripts/dev.ts"`, `"build": "vite build && electrobun build"`, `"typecheck": "tsc --noEmit"`. Deps + devDeps per Context.
- [ ] Write `tsconfig.json` (mirror landing; `include: ["src", "scripts", "*.config.ts"]`).
- [ ] Write `.gitignore`: `node_modules/`, `dist/`, `build/`, `artifacts/`, `.DS_Store`, `*.log`.
- [ ] Write placeholder `README.md` (one line; finalized in phase 04).
- [ ] `cd apps/electrobun-template && bun install` — confirm it resolves. Pin whatever `electrobun` version resolves; confirm the `ElectrobunConfig` type export exists (`node_modules/electrobun`) for phase 02.
- [ ] `git init` inside `apps/electrobun-template/` (independent repo).

## Done when

- `apps/electrobun-template/` exists with `package.json`, `tsconfig.json`, `.gitignore`, `README.md`, empty `src/bun/`, `src/main-ui/`, `scripts/`.
- `bun install` completes; `bun.lock` present; `node_modules/electrobun` exists.
- `apps/electrobun-template/.git` exists; nothing leaks into the parent repo's tracked files.

## Touches

- `apps/electrobun-template/package.json` — new.
- `apps/electrobun-template/tsconfig.json` — new.
- `apps/electrobun-template/.gitignore` — new.
- `apps/electrobun-template/README.md` — placeholder.
- `apps/electrobun-template/src/{bun,main-ui}/`, `scripts/` — created.
