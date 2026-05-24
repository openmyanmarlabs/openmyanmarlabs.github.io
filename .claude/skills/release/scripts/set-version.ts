#!/usr/bin/env bun
// set-version.ts — bump an Electrobun app's version in the two places that
// matter: `electrobun.config.ts` `app.version` (the source of truth Electrobun
// bundles into version.json → what Updater.getLocalInfo().version returns and
// what the registry is compared against) and `package.json` `version` (kept in
// sync for sanity).
//
// Usage: bun set-version.ts <app-dir> <version>
//   e.g. bun set-version.ts apps/electrobun-template 0.0.2
//
// Prints the before→after for each file. Exits non-zero on any problem so the
// release workflow halts before building a mislabeled artifact.

import { join } from "node:path";

const [, , appDir, version] = Bun.argv;

if (!appDir || !version) {
  console.error("usage: bun set-version.ts <app-dir> <version>");
  process.exit(2);
}

// Plain semver only — the registry compare (evaluate-update.ts) is numeric
// major.minor.patch with no prerelease/build metadata.
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(
    `error: version must be plain semver major.minor.patch, got "${version}"`,
  );
  process.exit(2);
}

const configPath = join(appDir, "electrobun.config.ts");
const pkgPath = join(appDir, "package.json");

// --- electrobun.config.ts: replace `version` inside the `app: { ... }` block ---
const configFile = Bun.file(configPath);
if (!(await configFile.exists())) {
  console.error(
    `error: ${configPath} not found — is "${appDir}" an Electrobun app?`,
  );
  process.exit(1);
}
const configSrc = await configFile.text();

// Scope the match to the app block so we never touch e.g. build.bunVersion.
// Captures: (everything up to and including `version:` inside `app:{`) (quote) (old) (same quote)
const appVersionRe = /(app\s*:\s*\{[\s\S]*?version\s*:\s*)(["'])([^"']*)\2/;
const m = configSrc.match(appVersionRe);
if (!m) {
  console.error(`error: could not find app.version in ${configPath}`);
  process.exit(1);
}
const oldConfigVersion = m[3];
const newConfigSrc = configSrc.replace(appVersionRe, `$1$2${version}$2`);
await Bun.write(configPath, newConfigSrc);
console.log(
  `electrobun.config.ts  app.version: ${oldConfigVersion} -> ${version}`,
);

// --- package.json: set .version, preserve 2-space formatting + trailing NL ---
const pkgFile = Bun.file(pkgPath);
if (await pkgFile.exists()) {
  const pkg = JSON.parse(await pkgFile.text());
  const oldPkgVersion = pkg.version;
  pkg.version = version;
  await Bun.write(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log(`package.json        version: ${oldPkgVersion} -> ${version}`);
} else {
  console.log(`package.json        (none — skipped)`);
}

console.log(
  `\nVersion set to ${version}. Build will bundle this into version.json.`,
);
