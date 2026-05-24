# GitHub Pages + Cloudflare domain

How to serve a GitHub Pages site on a Cloudflare-managed domain with HTTPS.

## Two approaches

**A. DNS-only (gray cloud)** — simplest. Cloudflare just does DNS; GitHub handles SSL (Let's Encrypt) + CDN (Fastly). No Cloudflare proxy features. Recommended unless you need Cloudflare caching/WAF/rules.

**B. Proxied (orange cloud)** — Cloudflare in front (CDN, WAF, page rules, analytics). More setup + SSL gotchas. See below.

## DNS records (Cloudflare dashboard)

Apex domain (`example.com`) — A records to GitHub IPs:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

(optional IPv6 AAAA: `2606:50c0:8000::153`, `:8001::153`, `:8002::153`, `:8003::153`)

`www` subdomain — CNAME → `USERNAME.github.io`.
Cloudflare allows CNAME at apex (flattening), so apex can also CNAME → `USERNAME.github.io`.

## GitHub repo side

1. Settings → Pages → set source (branch / Actions).
2. Custom domain → enter `example.com` → writes a `CNAME` file in repo.
3. Wait for "DNS check successful".
4. Tick **Enforce HTTPS** (greyed out until cert provisioned — wait, retry).

## SSL — the key gotcha (approach B)

Cloudflare SSL/TLS mode (SSL/TLS → Overview):

- **Flexible** → ❌ redirect loop (`ERR_TOO_MANY_REDIRECTS`). GitHub forces HTTPS, CF talks HTTP to origin.
- **Full (strict)** → ❌ fails. GitHub's cert (or self-signed when proxied) won't validate.
- **Full** → ✅ correct.

Proxy blocks GitHub's Let's Encrypt domain validation. So provision cert FIRST:

1. Set records **DNS-only** (gray) initially.
2. Let GitHub issue cert + tick Enforce HTTPS.
3. Then flip to **proxied** (orange) + SSL mode **Full**.

## Verify

- `dig example.com` → GitHub IPs (or CF IPs if proxied).
- Site loads on `https://`, no cert warning, no redirect loop.
- DNS propagation up to ~24h.

## Troubleshoot

- Enforce HTTPS greyed out → DNS check not passed; recheck records for typos.
- Error 525 → set DNS-only / pause CF, test origin direct; conflicting redirect/page rules.
- Redirect loop → mode is Flexible; switch to Full.

## Sources

- [Cloudflare blog: Secure and fast GitHub Pages with Cloudflare](https://blog.cloudflare.com/secure-and-fast-github-pages-with-cloudflare/)
- [Cloudflare docs: ERR_TOO_MANY_REDIRECTS](https://developers.cloudflare.com/ssl/troubleshooting/too-many-redirects/)
- [Gist: HTTPS GitHub Pages with Cloudflare](https://gist.github.com/cvan/8630f847f579f90e0c014dc5199c337b)
- [Tutorial: GitHub Pages + Cloudflare custom domain](https://rikublock.dev/docs/tutorials/github-pages-cloudflare/)
