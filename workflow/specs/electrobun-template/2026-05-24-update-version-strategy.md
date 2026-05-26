# Spec — Update Version Strategy (2026-05-24)

One-line: Central `versions.json` registry on the org site; each Electrobun app fetches it (launch + manual), compares to its own version, and shows a bilingual "update available" banner that direct-downloads the right installer. Plus `.env` / `.env.example` scaffolding.

Source: `workflow/ideas/electron/update-version-strategy.md`

## Goal

Give OML desktop apps a lightweight, org-controlled way to tell users "a newer version exists." One `versions.json` (one entry per app: version + per-platform downloads + metadata) lives at the org site root. An app fetches it, compares against its running version, and — if outdated — surfaces a bilingual notice whose button starts the platform-correct installer download. **Notify only**: no auto-download, no auto-install, never blocks launch.

## Users / context

- End users of OML Electrobun desktop apps — Myanmar-first audience, may be offline.
- Maintainers who publish releases and hand-edit the registry.

## Scope

**In:**

- **Registry file** — `landing/public/versions.json` → served at `https://openmyanmarlabs.com/versions.json` (rides existing `deploy-landing.yml`; Vite copies `public/` → `dist/`).
- **Schema** — object keyed by app slug; each entry:
  ```json
  {
    "electrobun-template": {
      "version": "1.0.0",
      "downloads": { "macos": "…", "win": "…", "linux": "…" },
      "release_dir": "https://openmyanmarlabs.com/release/electrobun-template/",
      "released_at": "2026-05-24",
      "mandatory": false,
      "notes": { "en": "…", "my": "…" }
    }
  }
  ```
- **Release hosting** — installers under `landing/public/release/<app>/` → served at `https://openmyanmarlabs.com/release/<app>/`.
- **App integration (electrobun-template)**:
  - Renderer fetches `versions.json` and runs the version compare.
  - Renderer gets its own **version + platform** from a small bun RPC handler (bun reads `Updater.getLocalInfo().version`; `Updater` is bun-side only).
  - Check fires **on launch** and from a **"Check for Updates…" app-menu item** (menu lives in bun → signals renderer to run the check).
  - If outdated → bilingual "update available" banner; button **opens `downloads[platform]` directly** in the external browser (download starts immediately).
- **`.env` scaffolding** — `apps/electrobun-template/.env` (gitignored) + `.env.example` (committed). Documents **both**:
  - release/signing secrets: `ELECTROBUN_DEVELOPER_ID`, `ELECTROBUN_TEAMID`, `ELECTROBUN_APPLEID`, `ELECTROBUN_APPLEIDPASS` (+ App Store Connect key vars if used).
  - configurable URLs: registry URL + release base (renderer-visible → `VITE_`-prefixed, e.g. `VITE_OML_VERSIONS_URL`), defaulting to the prod `.com` URLs.
- **Seed** — single `electrobun-template` entry; maintainer hand-edits on each release.

**Out (non-goals):**

- Auto-download / auto-install / delta patching (Electrobun's built-in `downloadUpdate`/`applyUpdate`). Notify only.
- GitHub Releases hosting (chose Pages-hosted dir).
- CI automation of the registry bump (manual now; revisit later).
- Forced/blocking updates — `mandatory` only changes banner copy/dismissability, never blocks launch.
- Multi-app registry entries beyond the template (schema supports them; not seeded).

## Requirements

- [ ] `landing/public/versions.json` exists, valid JSON, one `electrobun-template` entry per schema above, served at `https://openmyanmarlabs.com/versions.json` after a landing deploy.
- [ ] `landing/public/release/electrobun-template/` path reserved/served for installers.
- [ ] Bun exposes an RPC (e.g. `getAppContext` / `getUpdateContext`) returning `{ version, platform }`, version from `Updater.getLocalInfo()`.
- [ ] Renderer, on launch, calls that RPC, fetches the registry, and compares versions via **semver** (major.minor.patch).
- [ ] On outdated: bilingual banner renders, using the app's current language (existing `language-toggle`); release `notes[lang]` shown when present.
- [ ] Banner button opens `downloads[platform]` in the external browser; if that platform URL is missing, fall back to opening `release_dir`.
- [ ] OS/platform detection comes from bun (`process.platform`) via the RPC, mapped to `macos`/`win`/`linux`.
- [ ] "Check for Updates…" app-menu item triggers the same check on demand.
- [ ] `mandatory: true` → banner non-dismissable; otherwise dismissable for the session (no persisted dismissal). Neither blocks launch.
- [ ] Offline / fetch error / malformed JSON → no banner, no error surfaced, app launches normally (silent fail).
- [ ] `apps/electrobun-template/.env.example` committed with documented keys; `.env` gitignored.

## Constraints

- Bilingual (EN + Burmese) for all user-facing copy (banner, menu item).
- Offline-first: version check must never block launch; failures silent.
- Renderer-visible config must be `VITE_`-prefixed (Vite env); signing secrets are build/CI env (bun side), never shipped to the renderer.
- Registry `version` must match the actually-built app version. Today `electrobun.config.ts` (`0.0.1`) and `package.json` (`0.0.0`) disagree — pick one source of truth before first real release.
- `versions.json` served via GitHub Pages CDN → may be briefly cached/stale after a bump.

## Acceptance — done when

- With registry `version` > local version, launching electrobun-template shows the bilingual "update available" banner; clicking the button opens the correct platform installer URL in the browser.
- With registry `version` ≤ local version, no banner appears.
- "Check for Updates…" menu item re-runs the check and shows the banner when outdated.
- Offline (or registry 404 / bad JSON): app launches normally, no banner, no error.
- `apps/electrobun-template/.env.example` is committed and lists signing secrets + configurable URLs; `.env` is gitignored.
- After a landing deploy, `https://openmyanmarlabs.com/versions.json` returns the seeded entry.

## Open questions

- **Binary hosting bloat** — installers in `landing/public/release/` commit binaries into the Pages repo (git bloat over many releases). Acceptable for now? Consider Git LFS or revisiting GitHub Releases if size grows.
- **Version source of truth** — reconcile `electrobun.config.ts` vs `package.json` version before the first published release; which one drives `Updater.getLocalInfo()`?
- **`win`/`linux` builds** — Electrobun builds target the host arch only; producing non-macOS installers needs per-OS CI runners. Are non-macOS downloads in scope for the first release, or macOS-only initially (other platform URLs omitted → button falls back to `release_dir`)?
- **Dismissal persistence** — session-only dismissal assumed; confirm we don't need "don't show again for this version."
