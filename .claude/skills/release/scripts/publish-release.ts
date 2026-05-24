#!/usr/bin/env bun
// publish-release.ts — take the flat files Electrobun emitted into `artifacts/`,
// copy the host platform's installer into the landing site's release dir, and
// rewrite the app's entry in versions.json (the registry the in-app update
// banner reads). Preserves every OTHER app entry and the download URLs for any
// platform THIS build didn't produce (Electrobun builds host-arch only, so a
// single run typically yields one platform).
//
// Usage:
//   bun publish-release.ts \
//     --app electrobun-template \
//     --version 0.0.2 \
//     --artifacts-dir apps/electrobun-template/artifacts \
//     --release-base-url https://openmyanmarlabs.com/release \
//     --landing-release-dir landing/public/release/electrobun-template \
//     --versions-json landing/public/versions.json \
//     --notes-en "Bug fixes and speedups." \
//     --notes-my "ပြင်ဆင်မှုများ။" \
//     --mandatory false \
//     [--include-updater]
//
// Prints a JSON summary to stdout. Exits non-zero (with a message on stderr) on
// any problem so the release workflow halts before committing/tagging.

import { mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

// --- arg parsing: supports `--key value` and `--key=value`; bare flags = true ---
function parseArgs(argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const eq = a.indexOf("=");
    if (eq !== -1) {
      out[a.slice(2, eq)] = a.slice(eq + 1);
    } else {
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        out[a.slice(2)] = next;
        i++;
      } else {
        out[a.slice(2)] = true; // bare flag
      }
    }
  }
  return out;
}

const args = parseArgs(Bun.argv.slice(2));

function req(name: string): string {
  const v = args[name];
  if (typeof v !== "string" || v.length === 0) {
    console.error(`error: missing required --${name}`);
    process.exit(2);
  }
  return v;
}

const app = req("app");
const version = req("version");
const artifactsDir = req("artifacts-dir");
const releaseBaseUrl = req("release-base-url").replace(/\/+$/, ""); // no trailing slash
const landingReleaseDir = req("landing-release-dir");
const versionsJsonPath = req("versions-json");
const notesEn =
  typeof args["notes-en"] === "string" ? (args["notes-en"] as string) : "";
const notesMy =
  typeof args["notes-my"] === "string" ? (args["notes-my"] as string) : "";
const mandatory = args["mandatory"] === true || args["mandatory"] === "true";
const includeUpdater =
  args["include-updater"] === true || args["include-updater"] === "true";

// --- locate the host platform's installer in artifacts/ ---
// Electrobun names files `{channel}-{os}-{arch}-{App}[-suffix].{ext}`. We key off
// the `-{os}-{arch}-` infix (channel-agnostic) + the installer extension. The
// `os` token doubles as the registry's downloads key (macos | win | linux).
let entries: string[];
try {
  entries = readdirSync(artifactsDir);
} catch {
  console.error(
    `error: cannot read artifacts dir "${artifactsDir}". Did the build run with --env=stable?`,
  );
  process.exit(1);
}

type Platform = "macos" | "win" | "linux";
const installerMatchers: {
  platform: Platform;
  test: (f: string) => boolean;
}[] = [
  {
    platform: "macos",
    test: (f) => /-macos-(arm64|x64)-/.test(f) && f.endsWith(".dmg"),
  },
  // Windows ships a Setup .exe inside a .zip.
  {
    platform: "win",
    test: (f) => /-win-(arm64|x64)-/.test(f) && f.endsWith(".zip"),
  },
  // Linux ships a self-extracting setup inside a .tar.gz.
  {
    platform: "linux",
    test: (f) => /-linux-(arm64|x64)-/.test(f) && f.endsWith(".tar.gz"),
  },
];

const found: { platform: Platform; file: string }[] = [];
for (const { platform, test } of installerMatchers) {
  const matches = entries.filter(test);
  if (matches.length === 0) continue;
  if (matches.length > 1) {
    console.error(
      `warning: multiple ${platform} installers in artifacts (${matches.join(", ")}); using "${matches[0]}"`,
    );
  }
  found.push({ platform, file: matches[0] });
}

if (found.length === 0) {
  console.error(
    `error: no installer found in "${artifactsDir}". Expected one of *.dmg / *.zip / *.tar.gz ` +
      `with an -{os}-{arch}- infix. Found: ${entries.join(", ") || "(empty)"}`,
  );
  process.exit(1);
}

// --- copy installer(s) (and optionally updater files) into the release dir ---
mkdirSync(landingReleaseDir, { recursive: true });

async function copyInto(file: string): Promise<number> {
  const src = Bun.file(join(artifactsDir, file));
  const bytes = src.size;
  await Bun.write(join(landingReleaseDir, file), src);
  return bytes;
}

const published: {
  platform: Platform;
  file: string;
  url: string;
  bytes: number;
}[] = [];
const copiedExtra: string[] = [];

for (const { platform, file } of found) {
  const bytes = await copyInto(file);
  published.push({
    platform,
    file,
    url: `${releaseBaseUrl}/${app}/${file}`,
    bytes,
  });

  if (includeUpdater) {
    // Host Electrobun's own auto-updater files for this os/arch: the version
    // manifest, the full compressed bundle, and incremental patches.
    const infix = file.match(/-(macos|win|linux)-(arm64|x64)-/)?.[0] ?? "";
    const extras = entries.filter(
      (f) =>
        f !== file &&
        infix &&
        f.includes(infix) &&
        (f.endsWith("update.json") ||
          f.endsWith(".tar.zst") ||
          f.endsWith(".patch")),
    );
    for (const ex of extras) {
      await copyInto(ex);
      copiedExtra.push(ex);
    }
  }
}

// --- update versions.json (merge, preserve everything else) ---
interface AppVersionEntry {
  version: string;
  downloads: Partial<Record<Platform, string>>;
  release_dir: string;
  released_at: string;
  mandatory: boolean;
  notes: { en: string; my: string };
}

let registry: Record<string, AppVersionEntry> = {};
const vf = Bun.file(versionsJsonPath);
if (await vf.exists()) {
  try {
    registry = JSON.parse(await vf.text());
  } catch {
    console.error(
      `error: ${versionsJsonPath} is not valid JSON — fix or remove it before releasing.`,
    );
    process.exit(1);
  }
}

const prev = registry[app];
const downloads: Partial<Record<Platform, string>> = {
  ...(prev?.downloads ?? {}),
};
for (const p of published) downloads[p.platform] = p.url;

const releasedAt = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

registry[app] = {
  version,
  downloads,
  release_dir: `${releaseBaseUrl}/${app}/`,
  released_at: releasedAt,
  mandatory,
  notes: {
    en: notesEn || prev?.notes?.en || "",
    my: notesMy || prev?.notes?.my || "",
  },
};

await Bun.write(versionsJsonPath, JSON.stringify(registry, null, 2) + "\n");

// --- summary ---
const summary = {
  app,
  version,
  previousVersion: prev?.version ?? null,
  releasedAt,
  mandatory,
  releaseDir: registry[app].release_dir,
  versionsJson: versionsJsonPath,
  landingReleaseDir,
  published: published.map((p) => ({
    platform: p.platform,
    file: p.file,
    url: p.url,
    sizeMB: +(p.bytes / 1_000_000).toFixed(2),
  })),
  platformsCarriedOver: Object.keys(downloads).filter(
    (k) => !published.some((p) => p.platform === k),
  ),
  includeUpdater,
  copiedExtra,
};

console.log(JSON.stringify(summary, null, 2));
