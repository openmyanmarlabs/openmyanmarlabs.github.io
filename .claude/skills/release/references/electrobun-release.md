# Electrobun release reference

Facts the `release` skill relies on, distilled from the local KB at
`workflow/learning/electron-bun/`. Cited so you can dig deeper when a build does
something unexpected. **Don't invent beyond this** — fall back to the upstream
repo (`https://github.com/blackboardsh/electrobun`) for anything not here.

## Build command + channels

`electrobun build [--env=dev|canary|stable]` — default `dev`. Always builds for
the **current host platform/arch only**; cross-platform needs a CI runner per
OS/arch.

- `dev` → runnable bundle in `build/`, **no distributable artifacts**.
- `canary` / `stable` → optimized bundle + tar/ZSTD compression + self-extractor,
  written as flat files into a project-relative **`artifacts/`** dir.

This skill builds **stable**. Run the renderer build first (Vite produces the
`dist/` the post-build hook copies into the bundle), then the electrobun build:

```bash
bunx vite build && bunx electrobun build --env=stable
```

(`bun run build` is `vite build && electrobun build` — i.e. `--env=dev` — so it
will **not** produce artifacts. Don't use it for a release.)

Source: `apis/cli/cli-args.md`, `guides/bundling-and-distribution.md`

## Artifact filenames

Flat files prefixed `{channel}-{os}-{arch}-` (the prefix keeps the channel even
for stable; the per-app channel _suffix_ is what stable drops). `os` ∈
`macos | win | linux` — the same tokens the registry's `downloads` keys use.

| Platform | Installer (what we publish)             | Updater extras (`--include-updater`)                           |
| -------- | --------------------------------------- | -------------------------------------------------------------- |
| macOS    | `stable-macos-<arch>-<App>.dmg`         | `...-update.json`, `...-<App>.app.tar.zst`, `...-<hash>.patch` |
| Windows  | `stable-win-x64-<App>-Setup.zip`        | `...-update.json`, `...-<App>.tar.zst`, `...-<hash>.patch`     |
| Linux    | `stable-linux-<arch>-<App>Setup.tar.gz` | `...-update.json`, `...-<App>.tar.zst`, `...-<hash>.patch`     |

`<App>` is `app.name` with spaces stripped. There is **no** macOS `.zip`/raw
`.app` artifact, and **no** Linux `.AppImage` — macOS = `.dmg`, Windows = `.zip`
(contains the Setup `.exe`), Linux = `.tar.gz` (contains a self-extracting setup).

The `publish-release.ts` script detects the installer by the `-{os}-{arch}-`
infix + extension, so it's channel- and name-agnostic.

Source: `guides/bundling-and-distribution.md` (Artifacts Folder Structure,
Platform Reference)

## Versioning → `getLocalInfo()`

`electrobun.config.ts` → `app.version` is the source of truth. At build time the
CLI bundles a `version.json`; `Updater.getLocalInfo()` reads it and returns
`{ version, hash, baseUrl, channel, name, identifier }` (all strings) — `version`
= `app.version`, `name` = `app.name`, `identifier` = `app.identifier`, `baseUrl`
= `release.baseUrl`, `channel` = the `--env` channel.

The registry `version` in `versions.json` is compared against
`getLocalInfo().version` (via the renderer's update check). **They must match**,
which is why `set-version.ts` bumps `app.version` before the build.

Source: `apis/updater.md` (getLocalInfo), `apis/cli/build-configuration.md`

## Hosting model

Two consumers of the release dir:

1. **This repo's notify-only banner (plan 008)** — only needs the platform
   **installer** hosted; the banner's Download button opens
   `downloads[platform]` (or falls back to `release_dir`) in the system browser.
   This is the default (`publish-release.ts` copies just the installer).
2. **Electrobun's own auto-updater** (not wired in this template yet) — at
   `release.baseUrl` it expects `{channel}-{os}-{arch}-update.json` + the full
   `.tar.zst` bundle + `.patch` files (keep old patches so users several
   versions behind can chain; otherwise it falls back to the full bundle). Pass
   `--include-updater` to also host these.

GitHub Releases caveat: `/releases/latest/download` resolves to non-prerelease
only, so canary auto-update won't work there — use S3/R2 for canary. (Moot for
the notify-only flow.)

Source: `apis/updater.md`, `guides/updates.md`, `guides/bundling-and-distribution.md`

## Code signing / notarization (macOS)

Two config booleans + env vars (read at build time):

```ts
// electrobun.config.ts
build: { mac: { codesign: true, notarize: true } }
```

```bash
# Apple ID method
export ELECTROBUN_DEVELOPER_ID="My Corp Inc. (TEAMID)"
export ELECTROBUN_TEAMID="TEAMID"
export ELECTROBUN_APPLEID="me@example.com"
export ELECTROBUN_APPLEIDPASS="app-specific-password"
# OR App Store Connect API key (CI-friendly; still needs DEVELOPER_ID + TEAMID)
export ELECTROBUN_APPLEAPIKEYPATH="/path/AuthKey_XXXX.p8"
export ELECTROBUN_APPLEAPIKEY="XXXXXXXXXX"
export ELECTROBUN_APPLEAPIISSUER="xxxxxxxx-...-xxxx"
```

These live in `apps/<app>/.env` (gitignored; see `.env.example`). The skill
sources them before building.

**Unsigned is allowed** — you'll still get a distributable, but an
internet-downloaded unsigned macOS app trips Gatekeeper ("is damaged and can't
be opened"); the user must run `xattr -cr /Applications/<App>.app`. The template
currently has **no `build.mac` block → unsigned**. The skill proceeds and warns;
enable the booleans + secrets above for a clean signed release.

Source: `guides/code-signing.md`, `apis/cli/build-configuration.md`

## `electrobun.config.ts` — relevant fields

```ts
app: { name: string; identifier: string; version: string }
build: {
  bun: { entrypoint: string /* + Bun.build opts */ },
  mac?: { codesign?: boolean; notarize?: boolean; icons?: string; /* ... */ },
  win?: { icon?: string; /* ... */ },
  linux?: { icon?: string; /* ... */ },
  copy?: Record<string, string>,
}
scripts?: { preBuild?; postBuild?; postWrap?; postPackage? }
release?: { baseUrl: string }   // static host for artifacts / updater
```

No `build.targets`/architectures field (host-only). No separate `artifacts`
block (implicit for non-dev builds).

Source: `apis/cli/build-configuration.md`, `guides/cross-platform-development.md`
