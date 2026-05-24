> Source: https://github.com/blackboardsh/electrobun/blob/main/docs/src/content/docs/electrobun/guides/updates.mdx · fetched 2026-05-24

# Updates

## Introduction

Batteries-included update mechanism. Bring your own static file host (AWS S3, Cloudflare R2, GitHub Releases).

- Update API — check, download, update apps.
- CLI — build bundle, codesign, generate artifacts.
- Custom BSDIFF in zig (SIMD-optimized) — updates as small as 14KB.

## Hosting on GitHub Releases

Convenient, especially for open source. Flat, prefix-based naming (e.g. `stable-macos-arm64-update.json`) works with hosts without folder structures.

### Configuration

Set `baseUrl` in `electrobun.config` pointing to GitHub Releases:

```javascript
// electrobun.config.ts
export default {
  // ...
  release: {
    baseUrl: "https://github.com/YOUR_ORG/YOUR_REPO/releases/latest/download",
  },
};
```

### Example GitHub Action

Builds + publishes releases on tag push:

```yaml
name: Build and Release

on:
  push:
    tags:
      - "v*"

jobs:
  build-macos-arm64:
    runs-on: macos-14 # Apple Silicon runner

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Determine build environment
        id: build-env
        run: |
          if [[ "${{ github.ref_name }}" == *"-canary"* ]]; then
            echo "env=canary" >> $GITHUB_OUTPUT
          else
            echo "env=stable" >> $GITHUB_OUTPUT
          fi

      - name: Build app
        env:
          ELECTROBUN_DEVELOPER_ID: ${{ secrets.ELECTROBUN_DEVELOPER_ID }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
        run: |
          if [ "${{ steps.build-env.outputs.env }}" = "canary" ]; then
            bun run build:canary
          else
            bun run build:stable
          fi

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: artifacts/*
          draft: false
          prerelease: ${{ steps.build-env.outputs.env == 'canary' }}
          generate_release_notes: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

`generate_release_notes: true` uses GitHub's auto release notes (lists merged PRs + contributors since last release).

## Limitations

### Single Patch File

Electrobun generates a single patch per build — from the immediately previous version to current. So:

- Users updating from the previous version get a small delta patch (often a few KB).
- Users more than one version behind auto-fall back to downloading the full `.tar.zst` bundle.

Practical tradeoff: keeps build simple while providing delta updates for regular updaters.

### Canary Builds on GitHub Releases

GitHub's `/releases/latest/download` only resolves to non-prerelease builds. So:

- **Stable builds**: auto-updates work via `/releases/latest/download`.
- **Canary builds**: won't auto-update on GitHub Releases (the `latest` URL skips prereleases).

For auto-updating canary builds, use a static host (Cloudflare R2, AWS S3) where you control the URL structure.
