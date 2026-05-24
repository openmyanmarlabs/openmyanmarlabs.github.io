> Source: https://github.com/blackboardsh/electrobun/blob/main/docs/src/content/docs/electrobun/guides/architecture/overview.mdx · fetched 2026-05-24

# Architecture Overview

## High Level App Architecture

An Electrobun app is essentially a Bun app. A tiny launcher (typically a zig binary) runs a Bun app. Native GUIs require a blocking event loop on the main thread, so the main Bun thread creates a webworker with your code, then uses Bun's FFI to init the native GUI event loop. Your Bun code (in the worker) uses Electrobun's APIs — many of which call Electrobun's native wrapper code via Bun's FFI to open windows, create system trays, relay events/RPC, etc.

## Application Bundles

### MacOS

#### Your Installed App

A `.app` bundle is just a folder with a `.app` extension. Key subfolders:

```
// electrobun places several binaries here. If bundling additional binaries on Mac and code-signing you must place them here
/Contents/MacOS

// An optimized zig implementation of bspatch used to generate and apply diffs during updates
/Contents/MacOS/bspatch

// The bun runtime
/Contents/MacOS/bun

// An optimized zig binary that typically just calls `bun index.js` with the included runtime
// to run your compiled bun entrypoint file.
/Contents/MacOS/launcher

// A library containing Electrobun's native code layer for the platform, on MacOS this these are
// objc/c++ code for interfacing with MacOS apis like NSWindow and WKWebkit
/Contents/MacOS/libNativeWrapper.dylib

// electrobun compiles your application's custom code here
/Contents/MacOS/Resources

// Your application icons
/Contents/MacOS/Resources/AppIcon.icns

// Local version info that `Electrobun.Updater` reads
/Contents/MacOS/Resources/version.json

// Folder containing the bundled javascript code for the main bun process.
// Use electrobun.config to tell Electrobun where your ts entrypoing is and
// define external dependencies
/Contents/MacOS/Resources/app/bun/

// This is where your views defined in electrobun.config.ts are transpiled to
// Browserviews can also use the views:// url schema anywhere urls are loaded
// to load bundled static content from here.
/Contents/MacOS/Resources/app/views
```

#### IPC

To communicate between bun and browser contexts, Electrobun uses several IPC mechanisms — mostly postmessage and FFI, plus more efficient encrypted web sockets.

#### Self-Extracting Bundle

Zip compression isn't great, and Electrobun apps should be tiny — so Electrobun auto-bundles into a self-extracting ZSTD bundle. It tars the entire app bundle, compresses (best-in-class modern compression), and creates a second wrapper app bundle for distribution.

> **Note:** The current Electrobun Playground app is 50.4MB (mostly the bun runtime), but compressed/distributed as the self-extracting bundle it's only 13.1MB — almost 5x smaller. Almost 5x as many users can download for the same storage/network cost.

Self-extracting bundle structure:

```
// This is different from the regular launcher binary. It's a zig binary that uses zlip to decompress your actual app bundle
/Contents/MacOS/launcher

// App icons are actually stored again so the self-extractor looks just like your extracted bundled app.
/Contents/Resources/AppIcons.icns

// Your actual app bundled, tarred, and compressed with the name set to the hash
/Contents/Resources/23fajlkj2.tar.zst
```

Install it like any other app in `/Applications/` or run from any folder. On first double-click, it transparently self-extracts, replaces itself with the full app, and launches. To the user, first open just takes 1-2s longer.

Self-extraction happens only on first install, entirely local/self-contained, using only a designated application support folder.

#### DMG

Electrobun auto-generates a DMG with the self-extracting bundle inside.

## Code Signing and Notarization

Electrobun auto code-signs + notarizes.

### MacOS

Prerequisite: Apple Developer account, app id, downloaded code signing certificate (guide coming). No private keys needed in the repo, but set `codesigning` and `notarization` flags to `true` in `electrobun.config` and make credentials available in your env.

On MacOS, Electrobun signs + notarizes both the app bundle **and** the self-extracting bundle, so users trust it's legitimately from you and Apple-scanned.

Code signing is fast; notarization uploads a zip to Apple's servers + waits for scan/verify (~1-2 min). Notarization is stapled to the app bundle.

Since notarization takes time, when a bug only exists on non-dev builds, turn off code signing/notarization in `electrobun.config` while debugging to speed builds.

Notarization issues appear in the terminal — typically resolved by setting entitlements declaring what the app uses.

## Updating

Built-in update mechanism optimized for file-size + efficiency.

> **Note:** Ship updates as small as 14KB — ship often without huge storage/network fees. No server required; just a static host like S3 behind a CDN like Cloudfront. Most apps fall within AWS's free tier even shipping often to many users.

### How does it work

Using the Electrobun Updater API you check for, download, and install updates. Flow:

1. Check local `version.json` hash against the hosted `update.json` hash of the latest version.
2. If different, download the tiny patch file matching your hash (BSDIFF-generated) and apply it to the current bundle.
3. Hash the patched bundle. If it matches latest, replace the running app with the latest version and relaunch (control timing via the API; let users trigger manually).
4. If hash doesn't match latest, look for another patch file and keep patching until it does.
5. If patching can't reach latest, download a zlib-compressed bundle from your static host and complete the update that way.

> **Note:** Each non-dev build auto-generates a patch from the current hosted version to the newly built version. You decide how many patches to keep on your static host.

## CLI and development builds

CLI is auto-installed locally when you `bun install electrobun`. Add npm scripts + an `electrobun.config` file to build.

### Development Builds

A `dev` build uses a special dev launcher binary (instead of the optimized `launcher`) that routes bun/zig/native output to your terminal. Dev builds aren't for distribution — the CLI doesn't generate artifacts for them.

### Distribution

`canary` and `stable` builds generate an `artifacts` folder with everything to upload to a static host for distribution + updates.
