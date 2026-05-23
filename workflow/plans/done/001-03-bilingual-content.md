# 001-03 — Bilingual content (en / my)

Plan: `001-root-brand-landing.md` · Blocked by: 01 · Parallel-safe with: 02

## Goal

Author the full bilingual copy in `src/content.js` — identical `en`/`my` key trees for every section, so section components just read keys.

## Context

- Blocked by 01 (content.js skeleton + i18n exist). Parallel-safe with 02 (primitives — disjoint files).
- **Myanmar-first**: `my` is default render lang; both objects **identical keys** (toggle swaps object). Asymmetric keys = bug.
- App **names stay English** in both langs (product brands); only taglines + surrounding copy translate.
- All copy is data — `src/content.js` under `en`/`my`.
- App collection (name · status · EN one-line; translate one-lines, keep names):
  - Daily Sales · 🟢 Live · "See every shop's daily takings in one number you can trust."
  - Hotel Management · Coming soon · "Rooms, bookings and the front desk — without the spreadsheets."
  - School Management · Coming soon · "Students, fees and attendance, all in one place."
  - Mini ERP · Coming soon · "Inventory, sales and accounts for growing businesses."
  - Restaurant POS · Coming soon · "Orders, tables and the day's total — at counter speed."
  - Clinic & Pharmacy · Coming soon · "Patients, prescriptions and stock, kept simple."
- Daily Sales = featured/Live, links to its own app landing (placeholder `href` field).
- Approach — 4 principles (title + blurb, translate both):
  1. Free to start — real tools free for small businesses; pay only when you grow into the parts that need the cloud.
  2. Offline-first — works on the device, syncs when back online (connections drop in Myanmar).
  3. Meet you where you work — no training, no bookkeeping degree; fits the counter / front desk / classroom.
  4. Earn trust, then grow — get the one number right first, then earn the next step.
- Stats (label + value): 2+ yrs paying customers · 25k+ owners in community · 1 → 6 apps live and on the way · 100% offline-first.
- Sections needing copy: Nav (logo alt, link labels, "Get notified", EN/မြန်မာ toggle label), Hero (headline + sub), Apps (heading + app list + "Open app →"), Approach (heading + 4 principles), Stats (heading + 4 stats), CTA (heading, sub, email placeholder, submit label, success msg — visual-only), Footer (brand line, tagline, Apps/Company column labels).
- Brand framing: OpenMyanmarLabs = software lab making free, offline-first tools for Myanmar SMEs (shops, hotels, schools, restaurants, clinics). Showcase, not product page.

## Steps

- [ ] Define shared app shape (name, status, tagline, href?, featured?) reused across en/my.
- [ ] Author `en` copy for every section above.
- [ ] Author `my` (Burmese) copy mirroring same keys; app names stay English.
- [ ] Encode 4 approach principles + 4 stats in both langs.
- [ ] Add nav/footer link labels, CTA strings, toggle label.
- [ ] Verify `en`/`my` key parity (same nested structure).

## Done when

- `en` and `my` have identical key trees, no missing keys.
- All six apps present: English names + translated taglines + status; Daily Sales featured + href.
- Approach (4), Stats (4), Nav, Hero, CTA, Footer copy present in both langs.
- Toggling lang swaps all visible strings (verified once sections exist).

## Touches

- `landing/src/content.js` — full en/my copy trees.
