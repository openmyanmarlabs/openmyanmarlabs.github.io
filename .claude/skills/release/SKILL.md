---
name: release
description: >-
  Cut a release of a targeted Electrobun app in this monorepo — bump the
  version, build a distributable installer, publish it to the landing site's
  release dir, update the in-app update registry (versions.json), and commit +
  tag the app's own git repo. Use this whenever the user wants to release /
  ship / publish / cut / tag a version of an app under apps/* — e.g.
  "/release electrobun-template 0.0.2", "release the template at 0.0.3",
  "cut a 1.0 release", "ship version 0.2.0 of the app", "build and tag a
  release", "publish a new app version". Reach for it even if they don't say
  the word "release": the trigger is the intent to turn the current app code
  into a downloadable, versioned, tagged build that the update banner can offer.
  Do NOT use this for a plain dev run (use the run/dev flow) or for landing-site
  content changes unrelated to shipping an app build.
---

# Release an Electrobun app

Turn the current code of `apps/<app>` into a versioned, downloadable build:
bump the version → build a distributable → publish the installer to
`landing/public/release/<app>/` → update `landing/public/versions.json` (the
registry the in-app update banner reads) → commit + tag the **app's own** git
repo. Stop before pushing (pushing landing triggers the production deploy).

**Usage:** `/release <app> <version>` — e.g. `/release electrobun-template 0.0.2`.

This is the publish counterpart to plan 008's update feature: the banner only
appears when the registry `version` is newer than what the installed app reports
from `Updater.getLocalInfo()`. So the whole point of this skill is to move both
forward together — the built app _and_ the registry — without them drifting.

## Why this isn't just `bun run build`

`bun run build` is `vite build && electrobun build`, and bare `electrobun build`
defaults to `--env=dev`, which produces a runnable bundle but **no distributable
artifacts**. A real release must build the **stable** channel so Electrobun emits
flat installer files into the (gitignored) `artifacts/` dir. The build command
this skill runs is therefore:

```bash
bunx vite build && bunx electrobun build --env=stable
```

Read `references/electrobun-release.md` for the artifact naming, channels,
signing, and updater details — consult it whenever you're unsure what a built
file is or where it goes.

## Two repos, one release

- **`apps/<app>/`** has its **own** git repo (the root `.gitignore` ignores
  `apps/*`). The version bump (electrobun.config.ts + package.json) is committed
  and **tagged here**.
- **`landing/`** lives in the **root** repo and deploys to
  `https://openmyanmarlabs.com` via GitHub Pages. The published installer +
  updated `versions.json` are committed here.

Keep the two commits separate — they're different repos.

## Workflow

Run from the repo root. Treat each step as a gate: if one fails, stop and report
rather than charging ahead — a half-built release that's already tagged is worse
than a clean stop.

### 1. Resolve + validate

- Parse `<app>` and `<version>`. The user may type a loose name (e.g.
  `electron-template`); the real dir is `apps/<app>`. If `apps/<app>` doesn't
  exist, `ls apps/` and suggest the closest match instead of guessing.
- `<version>` must be plain semver `major.minor.patch` (the registry compare in
  `evaluate-update.ts` is numeric-only — no prerelease tags). Reject anything
  else.
- Read the app's current `electrobun.config.ts` `app.version`. If `<version>` is
  not strictly greater, warn and confirm before continuing — a build whose
  version ≤ the registry won't ever show the banner.
- Check the app repo has no tag named `<version>` already
  (`git -C apps/<app> tag -l <version>`). If it exists, stop.
- The **registry key** and **release subdir** are both `<app>` (matches
  `versions.json`'s top-level key and `landing/public/release/<app>/`).

### 2. Preflight the build environment

- The app's signing secrets live in `apps/<app>/.env` (gitignored). Source them
  for the build: `set -a && . apps/<app>/.env && set +a` (or pass through).
- Check `electrobun.config.ts` for `build.mac.codesign` / `build.mac.notarize`.
  If they're absent or false, the build is **unsigned** — proceed (per the
  chosen default) but warn the user clearly: downloaded copies hit macOS
  Gatekeeper's "is damaged and can't be opened" error until the user runs
  `xattr -cr /Applications/<App>.app`. Note that enabling signing needs the
  `ELECTROBUN_*` vars (see `references/electrobun-release.md`).
- Electrobun builds **host-arch only**. On a Mac you get the macOS installer
  only; Windows/Linux installers need a build on those OSes (or CI). So this run
  will update just the host platform's download URL and leave the others as they
  were.

### 3. Bump the version (source of truth)

The version Electrobun bundles into `version.json` (what `getLocalInfo()`
returns, and what the registry is compared against) comes from
`electrobun.config.ts` `app.version`. Set it — and `package.json` `version` for
consistency — with the bundled script:

```bash
bun .claude/skills/release/scripts/set-version.ts apps/<app> <version>
```

It edits `app.version` in `electrobun.config.ts` and `version` in `package.json`,
and prints the before→after. Eyeball the diff.

### 4. Build the distributable

```bash
cd apps/<app> && bunx vite build && bunx electrobun build --env=stable
```

Watch the output. A successful build populates `apps/<app>/artifacts/` with flat,
prefixed files (`stable-<os>-<arch>-...`). If the build fails (common causes:
signing misconfig, missing `.env`, a TS/Vite error), stop and surface the error
— do not publish or tag.

### 5. Publish artifacts + update the registry

Gather the release notes first (the one human input): ask the user for **English
notes**, **Burmese (my) notes**, and whether this is **mandatory** (default no).
Keep notes short — they render in the banner.

Then run the publish script, which copies the host-platform installer from
`artifacts/` into `landing/public/release/<app>/` and rewrites the `<app>` entry
in `versions.json` (preserving every other app + the download URLs for platforms
this build didn't produce):

```bash
bun .claude/skills/release/scripts/publish-release.ts \
  --app <app> \
  --version <version> \
  --artifacts-dir apps/<app>/artifacts \
  --release-base-url https://openmyanmarlabs.com/release \
  --landing-release-dir landing/public/release/<app> \
  --versions-json landing/public/versions.json \
  --notes-en "<english notes>" \
  --notes-my "<burmese notes>" \
  --mandatory <true|false>
```

It prints a JSON summary: which platform(s) it published, the copied filenames,
and the resulting download URLs. Sanity-check that summary against what step 4
built. (Pass `--include-updater` if you also want to host Electrobun's own
updater files — `update.json`, `*.app.tar.zst`, `*.patch` — for auto-update;
omit it for the default notify-only download flow to keep the Pages repo lean.)

### 6. Commit + tag the app repo

Only the version-bump files change here (`artifacts/` is gitignored):

```bash
git -C apps/<app> add electrobun.config.ts package.json
git -C apps/<app> commit -m "chore(release): <version>"
git -C apps/<app> tag <version>
```

Use the **bare** version as the tag name (e.g. `0.0.2`). End the commit body with
the Co-Authored-By trailer per the repo's git convention.

### 7. Commit the landing repo

```bash
git -C . add landing/public/release/<app> landing/public/versions.json
git -C . commit -m "chore(release): publish <app> <version>"
```

### 8. Stop and report

Do **not** push. Report:

- What built: platform/arch, signed or unsigned (with the xattr note if unsigned).
- Files published to `landing/public/release/<app>/` + their sizes.
- The `versions.json` diff (old → new version, which download URLs changed).
- The app commit + tag, and the landing commit.
- The exact push commands, flagged that pushing landing kicks off the prod
  GitHub Pages deploy:
  ```bash
  git -C apps/<app> push && git -C apps/<app> push --tags
  git -C . push
  ```
- Any caveat that applies: unsigned build, host-arch-only (other platforms still
  point at the previous URLs / release_dir fallback), binary size in the Pages
  repo (revisit Git LFS / GitHub Releases if this grows).

## Failure handling

- **App dir not found** → list `apps/` and suggest the closest name; don't invent one.
- **Version not greater / tag exists** → stop, explain; offer to bump differently.
- **Build fails** → surface the real error; nothing is committed or tagged yet, so the tree is clean to retry.
- **No installer in `artifacts/`** → almost always means the build ran in `dev` (no artifacts) or failed silently; re-check the build command used `--env=stable`.
- **Partial success** → if you've already bumped+committed+tagged but a later step fails, say exactly what's done so a re-run or manual finish is unambiguous. Don't silently leave a tag pointing at a broken release.
