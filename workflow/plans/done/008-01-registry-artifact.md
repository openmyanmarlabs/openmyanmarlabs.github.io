# 008-01 — Registry artifact + release hosting

Plan: `008-root-update-version-strategy.md` · Blocked by: — · Parallel-safe with: 02, 03

## Goal

Create the seed `versions.json` registry + reserve the release-hosting path under the landing site, so it serves at `https://openmyanmarlabs.com/versions.json` after a landing deploy.

## Context

- This monorepo **is** the org site. `.github/workflows/deploy-landing.yml` builds `landing/` and publishes `landing/dist` to GitHub Pages at root `/` (CNAME → openmyanmarlabs.com). Vite copies `landing/public/*` → `landing/dist/*`, so a file at `landing/public/versions.json` serves at `https://openmyanmarlabs.com/versions.json`.
- Existing `landing/public/` already holds `CNAME`, `openmyanmarlabs-icon.svg`, `fonts/` — follow that as the static-asset home.
- Schema is fixed by the spec (`workflow/specs/2026-05-24-update-version-strategy.md`). One key per app; seed only `electrobun-template`.
- Pure data + a placeholder dir. No app code, no TS. Disjoint from phases 02–05.
- Binary hosting bloat is a known open risk — this phase only **reserves** the release path; do not commit real installers.

## Steps

- [ ] Create `landing/public/versions.json` with a single `electrobun-template` entry matching the spec schema: `version`, `downloads` (`macos`/`win`/`linux`), `release_dir`, `released_at`, `mandatory`, `notes` (`en`/`my`). Seed `version` low (e.g. `"0.0.0"`) so a built app can test "up to date"; put real `https://openmyanmarlabs.com/release/electrobun-template/...` URLs in `downloads`/`release_dir`.
- [ ] Reserve `landing/public/release/electrobun-template/` — add a `.gitkeep` (and optionally a minimal `index.html` placeholder download page that `release_dir` points at).
- [ ] Verify valid JSON (`bun -e "JSON.parse(await Bun.file('landing/public/versions.json').text())"` or equivalent).
- [ ] Confirm it builds through: `cd landing && bun run build` → `landing/dist/versions.json` exists and `landing/dist/release/electrobun-template/` is present.

## Done when

- `landing/public/versions.json` is valid JSON, one `electrobun-template` entry, all schema fields present.
- `landing/public/release/electrobun-template/` exists (tracked via `.gitkeep`).
- `cd landing && bun run build` copies both into `landing/dist/`.

## Touches

- `landing/public/versions.json` — new registry file (seed).
- `landing/public/release/electrobun-template/.gitkeep` — reserve release path.
- `landing/public/release/electrobun-template/index.html` — (optional) placeholder download page.
