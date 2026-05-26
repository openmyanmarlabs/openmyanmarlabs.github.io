# 023-10 — Backend-e2e gate + signing/notarization + v1 release

Plan: `023-root-open-myanmar-content-v1.md` · Blocked by: 01, 02, 03, 04, 05, 06, 07, 08, 09 · Parallel-safe with: —

## Goal

Lock v1: L1 backend-e2e suite across the assembled main-process stack, manual GUI walk on mac + win, signed/notarized installers published to the landing site, version registered, repo tagged `open-myanmar-content-v0.1.0`.

## Context

- L1 backend-e2e per `.claude/skills/backend-e2e/SKILL.md` — assembles each phase's real `create<Feature>Handlers(service)` map against in-memory SQLite (`src/bun/db/test-db.ts`) + FAKE sidecars (fake `ollamaClient`, fake `sdRunner`, fake fs/dialog). Tests integration **across** phases — the seam units don't cover. Don't import `migrate.ts` in tests (boots Electrobun runtime).
- Pattern reference: `apps/open-myanmar-speech/src/bun/rpc/speech-handlers.e2e.test.ts`. File suffix `*.e2e.test.ts`.
- Manual GUI verify per `.claude/skills/verify/SKILL.md` (note: skill dir not present at plan time — confirm at exec). Covers unautomatable: relaunch persistence, no-FOUC, Burmese fonts on Windows, real FB/IG paste, Ollama lifecycle (process gone after quit), SD timing on M3/M4 + Windows CUDA + Windows CPU fallback.
- Release per `.claude/skills/release/SKILL.md` — bumps version, builds installer, publishes to landing-site release dir, updates `versions.json`, commits + tags. Mirror what open-myanmar-invoice + open-myanmar-speech do.
- Signing:
  - mac: Developer ID Application + notarytool. Reuse monorepo infra used by speech/invoice releases.
  - win: Authenticode (timestamped). Confirm cert/credentials available BEFORE starting the release run.
- Landing site: NOT present on disk at plan time (memory references `apps/landing/data/apps.ts` + `apps/landing/public/releases/` — version seed entry already added per memory). At exec, confirm actual structure + that `update-api.ts` (Phase 01 stub) points at the same URL the landing serves.
- README + LICENSE: write concise per CLAUDE.md style. Speech has README; neither speech nor invoice has a LICENSE file on disk — confirm monorepo license posture before adding (likely MIT, match siblings).
- Version: `0.1.0` as first public release; confirm against speech/invoice initial-release versions in their `electrobun.config.ts` and align.
- Open questions to discharge in this phase (from root): festival/SME prompt scaffold sanity review (politically sensitive triggers — flag only, no v1 filter), Ollama reachability from Myanmar IP (proxy/VPN test or MM tester; if unreachable, mirror registry or document known issue), font redistribution confirmed, SD Windows CPU fallback verified.
- Telemetry: none per spec.
- `plan-executor` can't invoke skills — read the cited SKILL.md files directly before starting each section.

## Steps

- [ ] Read `.claude/skills/backend-e2e/SKILL.md`, `.claude/skills/verify/SKILL.md` (if absent, fall back to root plan's manual-walk notes), `.claude/skills/release/SKILL.md`.
- [ ] Write `src/bun/rpc/captions.e2e.test.ts`: in-memory db + real templates/posts/settings repos + fake `ollamaClient` (returns canned bilingual JSON) + real caption-service + real caption-handlers. Assert: `generateCaption` writes `posts` row with correct bilingual fields; `saveManualCaption` works with no active model; switching template uses different system prompt.
- [ ] Write `src/bun/rpc/images.e2e.test.ts`: real image-service + handlers + fake fs (temp dir). Assert: import → list → crop (parent_id linkage) → setTags → delete (file + row both removed).
- [ ] Write `src/bun/rpc/posters.e2e.test.ts`: real poster-handlers + real image-service + fake `Utils.showSaveDialog` + temp fs. Assert: `savePosterToLibrary` inserts image with `source='poster'` + tag; `attachPosterToPost` updates the row.
- [ ] Write `src/bun/rpc/sd.e2e.test.ts`: real sd-service + fake `sdRunner` + real image-service + fake `ollamaClient` (translation). Assert: Burmese prompt → translate call → generate call → image row with `source='ai-generated'`.
- [ ] Write `src/bun/rpc/history.e2e.test.ts`: seed posts repo with mix → `listPosts` with various filters narrows correctly; `deletePost` frees row.
- [ ] `bun test` — full suite green (units + e2e).
- [ ] Manual GUI walk on fresh M-series Mac: clean install → brand wizard → skip OR fill → model picker → install Gemma → caption flow → image library import + crop + AI-gen → poster export + save → history page + reuse + delete → quit + relaunch (data persists) → quit again (Ollama process gone).
- [ ] Manual GUI walk on Windows 11 CUDA box.
- [ ] Manual GUI walk on Windows 11 CPU-fallback box (verifies SD fallback).
- [ ] File + fix any blocking bugs found; re-run walks.
- [ ] Poster template polish pass: hit every `// TODO(design)` marker in `src/features/posters/templates/*.tsx`; design half-day OR accept "functional design" v1 depending on schedule — record decision.
- [ ] Ollama-from-Myanmar reachability test (proxy/VPN or MM tester); document outcome. If unreachable: mirror model registry OR document as known issue in README + release notes.
- [ ] Sanity-review the 7 SME + 12 festival prompt scaffolds for politically sensitive triggers; flag in a note (no filter code in v1).
- [ ] Write `apps/open-myanmar-content/README.md` (what it is, OS support, model downloads, dev run, build) — concise per CLAUDE.md.
- [ ] Add `apps/open-myanmar-content/LICENSE` — match monorepo posture (confirm against siblings first; speech/invoice currently have none on disk — resolve the monorepo-wide answer here if still open).
- [ ] Confirm landing site has open-myanmar-content entry in `apps/landing/data/apps.ts` (per memory, version seed already added); add/correct if missing.
- [ ] Confirm `versions.json` URL convention matches what `update-api.ts` (Phase 01) points at; align one to the other.
- [ ] Bump `apps/open-myanmar-content/electrobun.config.ts` → `app.version = "0.1.0"` (confirm against speech/invoice first-release versions).
- [ ] Run the release flow per `.claude/skills/release/SKILL.md` (e.g. `/release open-myanmar-content 0.1.0`): build installers, sign + notarize mac, sign win, publish installers + update `versions.json` in landing-site release dir, commit + tag.
- [ ] Smoke-install both installers on clean machines/VMs — verify signature trust, first launch, no Gatekeeper / SmartScreen blocks (or document user steps).
- [ ] Update-banner end-to-end check: with `0.1.0` running, bump landing-site `versions.json` to `0.1.1` (fake) → confirm banner shows in app → revert.
- [ ] Tag repo: `git tag open-myanmar-content-v0.1.0` (per release skill conventions).

## Done when

- 5 new `*.e2e.test.ts` files green; `bun test` green overall.
- Landing site serves both installer URLs + a `versions.json` the in-app update banner reads.
- README + LICENSE in place.
- Update banner verified end-to-end via a fake version bump.

## Touches

- `apps/open-myanmar-content/src/bun/rpc/captions.e2e.test.ts` — new.
- `apps/open-myanmar-content/src/bun/rpc/images.e2e.test.ts` — new.
- `apps/open-myanmar-content/src/bun/rpc/posters.e2e.test.ts` — new.
- `apps/open-myanmar-content/src/bun/rpc/sd.e2e.test.ts` — new.
- `apps/open-myanmar-content/src/bun/rpc/history.e2e.test.ts` — new.
- `apps/open-myanmar-content/README.md` — new.
- `apps/open-myanmar-content/LICENSE` — new (match monorepo; confirm at exec).
- `apps/open-myanmar-content/electrobun.config.ts` — version bump → `0.1.0`.
- `apps/open-myanmar-content/src/features/posters/templates/*.tsx` — design polish (`// TODO(design)` cleanup).
- `apps/landing/data/apps.ts` — confirm/add open-myanmar-content entry (version seed per memory).
- `apps/landing/public/releases/open-myanmar-content/{versions.json, *.dmg, *.exe}` — new artifacts (confirm landing path at exec — landing app not on disk at plan time).

## Open items (flag for exec)

- `.claude/skills/verify/` SKILL.md not present at plan time — confirm or follow inline manual-walk steps above.
- Landing app (`apps/landing/`) not on disk at plan time — paths above per memory; confirm structure before publishing.
- Monorepo LICENSE posture: neither speech nor invoice has a `LICENSE` file on disk; resolve repo-wide answer before adding here.
