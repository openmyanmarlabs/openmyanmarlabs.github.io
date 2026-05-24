# 008-03 — Update-eval logic + shared types (TDD)

Plan: `008-root-update-version-strategy.md` · Blocked by: — · Parallel-safe with: 01, 02

## Goal

The pure, framework-free core: shared registry types + a semver compare + an `evaluateUpdate()` decision function. Test-first. No React, no electrobun, no network — so it's the unit-tested heart that phases 04 + 05 build on.

## Context

- **Read `.claude/skills/tdd/SKILL.md` first** — drive this phase red→green→refactor, one behavior at a time, with `bun test` and co-located `*.test.ts`. This is exactly the "pure logic with a clear input→output contract" the skill targets. No `migrate.ts` import (not needed here; pure logic).
- Repo already unit-tests pure logic this way (e.g. `src/features/auth/validations/auth-schema.test.ts`).
- Shared types must be **type-only, side-effect free** — imported by BOTH bun and renderer (see the existing `src/shared/types.ts` / `src/shared/dto.ts` convention). Put registry types in a new `src/shared/update.ts`.
- Platform values are the registry's `downloads` keys: `"macos" | "win" | "linux"`. (Phase 04 maps `process.platform` → these; this phase just defines the type + consumes it.)
- `evaluateUpdate` decision rules (from spec):
  - `updateAvailable` = semver(latest) > semver(local).
  - `downloadUrl` = `entry.downloads[platform]` if present, else fall back to `entry.release_dir`.
  - carry through `latestVersion`, `mandatory`, `notes`.
- Semver = `major.minor.patch` numeric compare (split on `.`, compare componentwise). Keep it small; this is not full semver (no prerelease/build metadata needed).

## Steps

- [ ] Create `src/shared/update.ts` (type-only): `Platform = "macos" | "win" | "linux"`; `AppVersionEntry` (`version`, `downloads: Partial<Record<Platform, string>>`, `release_dir`, `released_at`, `mandatory`, `notes: { en: string; my: string }`); `VersionsRegistry = Record<string, AppVersionEntry>`; `UpdateContext = { version: string; platform: Platform }`; `UpdateDecision = { updateAvailable: boolean; latestVersion: string; downloadUrl: string; mandatory: boolean; notes: { en: string; my: string } }`.
- [ ] TDD `compareSemver(a, b)` in `src/features/update/lib/evaluate-update.ts` — start `evaluate-update.test.ts` with a failing case (`"1.2.0"` > `"1.1.9"`), then equal, then patch/minor/major, then uneven-length (`"1.0"` vs `"1.0.0"`). Red → green → refactor each.
- [ ] TDD `evaluateUpdate({ localVersion, entry, platform })` → `UpdateDecision`: newer-version case (updateAvailable true), equal/older (false), platform present → uses `downloads[platform]`, platform missing → falls back to `release_dir`, mandatory passthrough, notes passthrough.
- [ ] Run `bun test` (and `bun run typecheck`) — all green.

## Done when

- `bun test` green for: `compareSemver` (>, =, <, uneven lengths) and `evaluateUpdate` (available / not-available / platform-hit / platform-fallback / mandatory + notes passthrough).
- `bun run typecheck` passes; `src/shared/update.ts` is type-only (no runtime imports).

## Touches

- `src/shared/update.ts` — new shared registry/decision types.
- `src/features/update/lib/evaluate-update.ts` — `compareSemver` + `evaluateUpdate`.
- `src/features/update/lib/evaluate-update.test.ts` — co-located unit tests (TDD).
