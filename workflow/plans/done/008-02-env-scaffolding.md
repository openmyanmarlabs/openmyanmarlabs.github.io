# 008-02 — `.env` scaffolding (app)

Plan: `008-root-update-version-strategy.md` · Blocked by: — · Parallel-safe with: 01, 03

## Goal

Add `.env` / `.env.example` scaffolding to `apps/electrobun-template`: document release/signing secrets + the renderer-visible (`VITE_`) registry URLs, and ensure `.env` is gitignored while `.env.example` is committed.

## Context

- `apps/electrobun-template` has its **own** git init (root `.gitignore` ignores `apps/*`). So the app's own `apps/electrobun-template/.gitignore` is what governs — it currently lists only `node_modules/ dist/ build/ artifacts/ .DS_Store *.log` (NO `.env`). Must add `.env` there (keep `.env.example` tracked).
- Two kinds of vars (per spec):
  - **Release/signing secrets** (bun/CI build, macOS code-sign + notarize): `ELECTROBUN_DEVELOPER_ID`, `ELECTROBUN_TEAMID`, `ELECTROBUN_APPLEID`, `ELECTROBUN_APPLEIDPASS` (+ App Store Connect API key vars if used: `ELECTROBUN_APPLEAPIKEYPATH`, `ELECTROBUN_APPLEAPIKEY`, `ELECTROBUN_APPLEAPIISSUER`).
  - **Configurable URLs** (renderer-visible → must be `VITE_`-prefixed so Vite exposes them via `import.meta.env`): `VITE_OML_VERSIONS_URL` (default `https://openmyanmarlabs.com/versions.json`), `VITE_OML_RELEASE_BASE` (default `https://openmyanmarlabs.com/release`).
- Keep var **names** in sync with phase 05 (which reads `VITE_OML_VERSIONS_URL`).
- `.env.example` holds keys + safe defaults/placeholders only — never real secrets.

## Steps

- [ ] Add `.env` to `apps/electrobun-template/.gitignore` (leave `.env.example` tracked; optionally `!.env.example`).
- [ ] Create `apps/electrobun-template/.env.example` with two commented sections (signing secrets, configurable URLs) per Context. Secrets blank; URLs set to the prod `.com` defaults.
- [ ] (Optional) Create a local `apps/electrobun-template/.env` copy for dev — must stay untracked.

## Done when

- `apps/electrobun-template/.env.example` is committed, lists all signing-secret keys + `VITE_OML_VERSIONS_URL` / `VITE_OML_RELEASE_BASE` with defaults.
- `apps/electrobun-template/.gitignore` ignores `.env` (git does not track a real `.env`).

## Touches

- `apps/electrobun-template/.env.example` — new, committed.
- `apps/electrobun-template/.gitignore` — add `.env`.
