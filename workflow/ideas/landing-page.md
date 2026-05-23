# landing-for-apps — OpenMyanmarLabs brand site (summary)

**What:** Standalone brand showcase site for **OpenMyanmarLabs**, the parent lab behind the Daily Sales app.
**Language:** Bilingual, **Myanmar-first** (default) with an EN toggle.

---

## Purpose
Present OpenMyanmarLabs as a trustworthy brand — a software lab making free, offline-first tools for Myanmar's small businesses — and show the **whole app collection** at a glance. It is a *showcase*, not a product page: each app gets a name, a one-line, and a status (Live / Coming soon), with **no per-app feature depth**. The single conversion goal is the **"Get notified"** waitlist for upcoming apps.

## What it's for / Audience
Myanmar SME owners — the shops, hotels, schools, restaurants and clinics that run the local economy. Because the audience is Myanmar-based, the site loads in **Burmese by default** and offers English on toggle. It also acts as the hub that routes visitors to the live product (the **Daily Sales** card links straight to that app's landing).

## Services / the app collection
| App | Status | One-line |
|---|---|---|
| **Daily Sales** | 🟢 Live | See every shop's daily takings in one number you can trust. |
| **Hotel Management** | Coming soon | Rooms, bookings and the front desk — without the spreadsheets. |
| **School Management** | Coming soon | Students, fees and attendance, all in one place. |
| **Mini ERP** | Coming soon | Inventory, sales and accounts for growing businesses. |
| **Restaurant POS** | Coming soon | Orders, tables and the day's total — at counter speed. |
| **Clinic & Pharmacy** | Coming soon | Patients, prescriptions and stock, kept simple. |

App **names stay English** in both languages (they're product brands); taglines and all surrounding copy are translated. Apps are data — defined in `src/content.js` under both `en` and `my`.

## The brand promise (how we build)
Four principles shown in the "Approach" section, applied to every app:
1. **Free to start** — real tools free for small businesses; pay only when you grow into the parts that need the cloud.
2. **Offline-first** — works on the device, syncs when back online (connections drop in Myanmar).
3. **Meet you where you work** — no training, no bookkeeping degree; the app fits the counter / front desk / classroom.
4. **Earn trust, then grow** — get the one number right first, then earn the next step.

Credibility strip: **2+ yrs** of paying customers · **25k+** owners in the community · **1 → 6** apps live and on the way · **100%** offline-first.

## Page structure (single scroll)
`Nav → Hero → Apps → Approach → Stats → Get-notified CTA → Footer`
- **Nav** — sticky, translucent; logo + section links + EN/မြန်မာ toggle + "Get notified".
- **Hero** — brand statement + a **floating cluster of app-icon tiles** (Daily Sales lit as Live).
- **Apps** — the showcase gallery; Daily Sales featured with an "Open app →" link.
- **Approach** — the four principles.
- **Stats** — dark credibility strip.
- **Footer** — brand, tagline, Apps/Company link columns.

## Tech
- Vite + React 19 + `motion`. **No router, no state library** — one scrolling page; language via a small React context (`i18n.jsx`).

## Notes / extensibility
- All copy lives in `src/content.js` (`en` / `my`, identical keys); the toggle swaps which object renders.
- Pitch-demo scope: the waitlist is visual-only (no backend/auth).
