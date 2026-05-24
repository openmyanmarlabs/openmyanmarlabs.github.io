> Source: https://github.com/blackboardsh/electrobun/blob/main/docs/src/content/docs/electrobun/guides/code-signing.mdx · fetched 2026-05-24

# Code Signing

## Mac

Apple often ships machines with expired certificates — can loop generating/installing certs that show as not trusted. Avoid headaches by installing full Xcode from the App Store.

Setup steps:

1. Open Xcode → app menu → Settings → Accounts tab → add developer account.
2. Click "Manage Certificates" → `+` → add a "Developer ID Application" certificate. Confirm in Keychain Access (Login keychain, search "Developer ID Application") or in the Apple Developer portal.
3. Developer portal → Identifiers → `+` to add one for your app. Check "App Attest" so the CLI can codesign + notarize. Add other services if needed.
4. In a separate tab, log into [account.apple.com](https://account.apple.com/sign-in) → "App Specific Passwords" → create one for Electrobun. This is your `ELECTROBUN_APPLEIDPASS`.

Values for your `.zshrc` and where to find them:

```bash
ELECTROBUN_DEVELOPER_ID: In Apple Dev Portal open the certificate you created. The certificate name (probably your company name). eg: "My Corp Inc."

ELECTROBUN_TEAMID: In the Apple Dev Portal open the App Identifier you created for your app. Under "App ID Prefix" you'll see something like "BGU899NB8T (Team ID)" it's the "BGU899NB8T" part.

ELECTROBUN_APPLEID: This is your apple id email address, likely your personal apple id email address

ELECTROBUN_APPLEIDPASS: This is the app specific password you created for Electrobun code signing
```

Add to `.zshrc`:

```bash
export ELECTROBUN_DEVELOPER_ID="ELECTROBUN_DEVELOPER_ID: My Corp Inc. (BGU899NB8T)"
export ELECTROBUN_TEAMID="BGU899NB8T"
export ELECTROBUN_APPLEID="myemail@email.com"
export ELECTROBUN_APPLEIDPASS="your-app-specific-password"
```

In `electrobun.config`, set `build.mac.codesign` and `build.mac.notarize` to true:

```javascript
{
    "build": {
        "mac": {
            "codesign": true,
            "notarize": true,
        }
    }
}
```

Restart terminal. Confirm env is set:

```bash
echo $ELECTROBUN_TEAMID
```

Next build: CLI signs + notarizes the app, compresses into the self-extractor, then signs + notarizes the self-extractor.

### App Store Connect API Key (alternative)

Instead of Apple ID + app-specific password, authenticate with an App Store Connect API key. Preferred for CI/CD; avoids 2FA issues.

Create a key in [App Store Connect > Users and Access > Integrations > App Store Connect API](https://appstoreconnect.apple.com/access/integrations/api). Download the `.p8` file; note Issuer ID and Key ID.

```bash
export ELECTROBUN_APPLEAPIKEYPATH="/path/to/AuthKey_XXXXXXXXXX.p8"
export ELECTROBUN_APPLEAPIKEY="XXXXXXXXXX"
export ELECTROBUN_APPLEAPIISSUER="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

When set, Electrobun uses the API key for notarization instead of Apple ID. Still need `ELECTROBUN_DEVELOPER_ID` and `ELECTROBUN_TEAMID` for code signing.

## Unsigned Apps

Distributing unsigned (`codesign: false`): users downloading from the internet see a "damaged and can't be opened" error. macOS adds a quarantine attribute; Gatekeeper blocks unsigned quarantined apps.

To run an unsigned downloaded app, remove the quarantine attribute:

```bash
xattr -cr /Applications/YourApp.app
```

App then opens normally. Only needed for internet downloads — locally built/run apps have no quarantine attribute. For production, strongly recommend enabling code signing + notarization.
