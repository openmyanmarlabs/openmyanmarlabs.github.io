> Source: https://github.com/blackboardsh/electrobun/blob/main/docs/src/content/docs/electrobun/guides/bundling-and-distribution.mdx · fetched 2026-05-24

# Bundling & Distribution

> **Note:** Continues from the Creating UI guide.

Add two scripts to `package.json` for distribution: `build:canary` and `build:stable`.

```json
{
  "name": "my-app",
  "devDependencies": {
    "@types/bun": "latest"
  },
  "peerDependencies": {
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "electrobun": "^0.0.1"
  },
  "scripts": {
    "start": "electrobun run",
    "dev": "electrobun dev",
    "dev:watch": "electrobun dev --watch",
    "build:dev": "bun install && electrobun build",
    "build:canary": "electrobun build --env=canary",
    "build:stable": "electrobun build --env=stable"
  }
}
```

Run:

```bash
bun run build:canary

# or

bun run build:stable
```

Both non-dev builds:

- Build an optimized app bundle.
- Tar + compress with ZSTD.
- Generate a self-extracting app bundle.
- Create an `artifacts` folder for distribution.

> **Note:** To distribute, all you need is a static file host (S3, Google Cloud Storage). No server needed.

Add release `baseUrl` to `electrobun.config.ts` (e.g. a GCS bucket subfolder):

```typescript
export default {
  app: {
    name: "My App",
    identifier: "dev.my.app",
    version: "0.0.1",
  },
  build: {
    bun: {
      entrypoint: "src/bun/index.ts",
    },
    views: {
      "main-ui": {
        entrypoint: "src/main-ui/index.ts",
      },
    },
    copy: {
      "src/main-ui/index.html": "views/main-ui/index.html",
    },
  },
  release: {
    baseUrl: "https://storage.googleapis.com/mybucketname/myapp/",
  },
};
```

Publish by uploading `artifacts` contents to your release host (S3, R2, GitHub Releases, etc.).

Artifacts are flat files with `channel-os-arch` prefix (e.g. `canary-macos-arm64-update.json`). Flat structure works with any host, including GitHub Releases (no folders). CLI builds for the current machine's platform and downloads core/CEF files during bundling.

For all platforms, run the same build command on CI runners per OS/arch (see Cross-Platform Development).

After uploading artifacts, the next non-dev build downloads the current hosted version via `release.baseUrl` and generates a patch (optimized BSDIFF), added to artifacts.

Keep older patch files in storage. Users step through successive patches, each ~14KB. If patching can't reach latest, the Updater falls back to downloading the full build. See Updater API docs for checking/installing updates.

## Build Lifecycle Hooks

Run custom scripts at build stages — useful for: validating environment, transforming compiled code, adding custom files to bundle/wrapper, sending build-complete notifications.

Hooks (execution order): `preBuild`, `postBuild`, `postWrap`, `postPackage`. See Build Configuration docs for details/examples.

## Artifacts Folder Structure

Flat `artifacts` folder. All files prefixed `{channel}-{os}-{arch}-`:

```
artifacts/
├── canary-macos-arm64-update.json
├── canary-macos-arm64-MyCoolApp-canary.dmg
├── canary-macos-arm64-MyCoolApp-canary.app.tar.zst
├── canary-macos-arm64-a1b2c3d4.patch
├── canary-win-x64-update.json
├── canary-win-x64-MyCoolApp-Setup-canary.zip
├── canary-win-x64-MyCoolApp-canary.tar.zst
├── canary-win-x64-a1b2c3d4.patch
├── canary-linux-x64-update.json
├── canary-linux-x64-MyCoolAppSetup-canary.tar.gz
├── canary-linux-x64-MyCoolApp-canary.tar.zst
├── canary-linux-x64-a1b2c3d4.patch
└── ...
```

Flat structure works with any host, including GitHub Releases.

### Artifact Naming Conventions

- App names **sanitized** by removing spaces: "My Cool App" → "MyCoolApp" in all filenames.
- **Stable** builds: channel suffix omitted. Other channels (canary, beta) append the channel.
- Windows/Linux installers distributed as archives (`.zip`, `.tar.gz`). Archive filenames sanitized; installer files inside preserve spaces.

### macOS Artifacts

```
# Canary:
canary-macos-arm64-update.json                    # Version metadata for the Updater API
canary-macos-arm64-MyCoolApp-canary.dmg           # Installer DMG for first-time installs
canary-macos-arm64-MyCoolApp-canary.app.tar.zst   # Compressed app bundle for updates
canary-macos-arm64-a1b2c3d4.patch                 # Incremental patch from previous version

# Stable (no channel suffix):
stable-macos-arm64-MyCoolApp.dmg
stable-macos-arm64-MyCoolApp.app.tar.zst
```

### Windows Artifacts

```
# Canary:
canary-win-x64-update.json                       # Version metadata
canary-win-x64-MyCoolApp-Setup-canary.zip        # Zip containing the Setup .exe installer
canary-win-x64-MyCoolApp-canary.tar.zst          # Compressed app for updates
canary-win-x64-a1b2c3d4.patch                    # Incremental patch

# Stable:
stable-win-x64-MyCoolApp-Setup.zip
stable-win-x64-MyCoolApp.tar.zst
```

### Linux Artifacts

```
# Canary:
canary-linux-x64-update.json                        # Version metadata
canary-linux-x64-MyCoolAppSetup-canary.tar.gz       # tar.gz containing the self-extracting setup
canary-linux-x64-MyCoolApp-canary.tar.zst           # Compressed app for updates
canary-linux-x64-a1b2c3d4.patch                     # Incremental patch

# Stable:
stable-linux-x64-MyCoolAppSetup.tar.gz
stable-linux-x64-MyCoolApp.tar.zst
```

### Constructing Download URLs

Artifacts already prefixed, so download URL is `{baseUrl}/{artifact-filename}`:

```
# Examples (assuming baseUrl is "https://releases.example.com/myapp"):

# macOS ARM (Apple Silicon)
https://releases.example.com/myapp/canary-macos-arm64-MyCoolApp-canary.dmg

# macOS Intel
https://releases.example.com/myapp/canary-macos-x64-MyCoolApp-canary.dmg

# Windows
https://releases.example.com/myapp/canary-win-x64-MyCoolApp-Setup-canary.zip

# Linux x64
https://releases.example.com/myapp/canary-linux-x64-MyCoolAppSetup-canary.tar.gz

# Linux ARM
https://releases.example.com/myapp/canary-linux-arm64-MyCoolAppSetup-canary.tar.gz
```

### Platform Reference

| Platform | OS Value | Arch Values    | Installer Format                           |
| -------- | -------- | -------------- | ------------------------------------------ |
| macOS    | `macos`  | `arm64`, `x64` | `.dmg`                                     |
| Windows  | `win`    | `x64`          | `.zip` (contains `-Setup.exe`)             |
| Linux    | `linux`  | `x64`, `arm64` | `.tar.gz` (contains self-extracting setup) |

### Patch Files

Named with platform prefix + hash of source version (e.g. `canary-macos-arm64-a1b2c3d4.patch`). When replacing host contents, keep old patch files so users on older versions can step through incremental updates to latest.
