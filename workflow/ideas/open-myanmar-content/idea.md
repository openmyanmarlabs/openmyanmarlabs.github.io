# Open Myanmar Content — App Idea

## What is it?

A **free, open-source, standalone desktop app** (Mac + Windows) that helps Myanmar SMEs
create bilingual (Burmese + English) social media content — captions, post copy, and images
— and copy-paste it to Facebook or Instagram. No server. No subscription. No cost.

The core problem it solves: small teams run out of Burmese content ideas and don't know how
to write compelling marketing copy in Myanmar language. This app gives them an AI assistant
that understands Myanmar context, running entirely on their own machine.

---

## Who is it for?

**Primary user:** Small Myanmar business owner or a 1–3 person marketing team.

- Runs a tea shop, clothing brand, restaurant, retail store, beauty salon, etc.
- Posts to Facebook and Instagram regularly (or wants to)
- Not a developer — no technical background
- May own a modern Mac (M3/M4 Apple Silicon) or a mid-range Windows PC
- Comfortable with Burmese as their primary language

**Advanced user (future):** Agency or freelancer managing multiple client brands.

---

## The Real Pain Point

Writing Burmese marketing copy is hard, especially:

- When you post 3–5 times per week and run out of ideas
- Around traditional events (Thingyan, Thadingyut, Tazaungdaing, etc.) where tone matters
- When you want both Burmese and English in the same post
- When you need a caption that feels natural, not like a machine translation

No existing tool focuses on Burmese SME content. This is the gap.

---

## Core Principles

- **Zero cost to the user** — no API keys, no subscriptions, no cloud
- **Offline-first** — works without internet except when actually posting to social media
- **Bilingual** — Burmese + English throughout, UI and content
- **Non-technical UX** — designed for business owners, not developers
- **Open source** — built on the Open Myanmar Labs monorepo (Electrobun + Bun)

---

## What the App Does

### 1. AI-Powered Content Generation (Text)

The user fills in a brief — 3 inputs:

| Field                    | Example                                       |
| ------------------------ | --------------------------------------------- |
| What is this post about? | "မဆုံ brand လက်ဖက်ရည် ၅၀% လျှော့ဈေး ဒီတစ်ပတ်" |
| Tone                     | Casual / Professional / Festive               |
| Platform                 | Facebook / Instagram                          |

The AI outputs:

- Burmese caption (natural, marketing-ready)
- English caption
- Suggested hashtags (Myanmar-relevant)

The user edits if needed, then copies and pastes into Facebook/Instagram.

### 2. Post Templates

Pre-built templates pre-fill the brief structure so users don't start from scratch.

**SME Templates:**

- Product Sale / Discount
- New Product Launch
- Flash Sale (time-limited)
- Event Announcement
- Grand Opening / Anniversary
- Customer Review / Testimonial
- Delivery / Service Update
- Custom (free-form)

**Myanmar Traditional Event Templates (all 12 months):**

| Myanmar Month                | Gregorian Approx | Key Events                          |
| ---------------------------- | ---------------- | ----------------------------------- |
| တပို့တွဲ (Tabodwe)           | Jan–Feb          | Rice cake festival, pagoda events   |
| တပေါင်း (Tabaung)            | Feb–Mar          | Tabaung festival, full moon pagoda  |
| တန်ခူး (Tagu)                | Mar–Apr          | သင်္ကြန် Thingyan Water Festival    |
| ကဆုန် (Kason)                | Apr–May          | Watering Bodhi tree festival        |
| နယုန် (Nayon)                | May–Jun          | Exams season, Buddhist events       |
| ဝါဆို (Waso)                 | Jun–Jul          | Buddhist Lent begins, robe offering |
| ဝါခေါင် (Wagaung)            | Jul–Aug          | Mid-lent, pagoda festivals          |
| တော်သလင်း (Tawthalin)        | Aug–Sep          | Boat racing festivals               |
| သီတင်းကျွတ် (Thadingyut)     | Sep–Oct          | Light festival, end of Lent         |
| တန်ဆောင်မုန်း (Tazaungdaing) | Oct–Nov          | Festival of Lights                  |
| နတ်တော် (Nadaw)              | Nov–Dec          | Pagoda festivals, spirit events     |
| ပြိဿ (Pyatho)                | Dec–Jan          | Cool season festivals               |

**Custom Templates:** Users can create and save their own templates (e.g. "Weekly Promo"
for a tea shop that posts every Monday). Reusable, editable, stored locally.

### 3. Image Library + Crop

- Import images from local device (product photos, event photos)
- Organize images inside the app — reuse across multiple posts
- Basic crop and resize for correct aspect ratios:
  - 1:1 for Instagram
  - 4:3 or 16:9 for Facebook

### 4. AI Image Generation (Text-to-Image)

For users who want to generate background or decorative images (not product photos):

- User types a description (Burmese or English)
- **If Burmese is detected** → the text AI (Qwen2.5) silently translates it to English first,
  then shows the translated prompt to the user for review/edit before generating
- Stable Diffusion generates the image locally (no internet)
- Mac: Metal acceleration (~3–5s on M3/M4)
- Windows: CUDA or CPU fallback (~10–30s)
- Separate one-time model download (~2GB GGUF via stable-diffusion.cpp)

This is for generating mood images, backgrounds, event art — not product photography
(for product photos, users import from their device).

### 5. Brand Design System + Template-Based Image Posters

User sets up their brand once:

- Logo
- Primary color
- Secondary color
- Preferred font

All image poster templates automatically apply their brand identity. Templates include:

- Promotion poster
- New product showcase
- Flash sale banner
- Event announcement
- Holiday greeting (Thingyan, Tazaungdaing, etc.)
- 20+ templates total

The generated Burmese/English text from the content AI auto-fills into the chosen template.
Output: ready-to-post PNG at correct dimensions.

### 6. Post History

Every generated post is saved to local SQLite:

- Date and time
- Platform (Facebook / Instagram)
- Template used
- Burmese caption
- English caption
- Hashtags
- Attached or generated image

Users can browse history, reuse past posts, and avoid repeating promotions.

---

## Local AI Architecture

### Text AI — Ollama Sidecar

The app bundles the Ollama binary (platform-specific, ~100MB) inside the installer.
On first launch, the user downloads one or both text models:

| Model      | Size   | Use case                               |
| ---------- | ------ | -------------------------------------- |
| Qwen2.5:7b | ~4.4GB | Smart — better Burmese, needs 8GB+ RAM |
| Gemma3:4b  | ~2.5GB | Fast — lighter, works on 4GB RAM       |

- User can download both and switch between them in settings
- App spawns Ollama as a background sidecar process (starts with app, stops with app)
- All AI calls go to `localhost:11434` — never the internet

Ollama also handles **Burmese→English translation** for image prompts (no extra model).

### Image AI — stable-diffusion.cpp Sidecar

- Bundled C++ binary, platform-specific (Metal on Mac, CUDA/CPU on Windows)
- No Python required
- User downloads one SD model (~2GB GGUF, one-time)
- App calls it as a subprocess: prompt in → PNG out
- Translated English prompt always used (Burmese auto-translated via Qwen2.5)

### Installer Size

```
Installer (~150–200MB)
├── Electrobun app
├── Ollama binary (platform-specific)
└── stable-diffusion.cpp binary (platform-specific)

First-launch downloads (user chooses):
├── Qwen2.5:7b    ~4.4GB  (text AI, smart)
├── Gemma3:4b     ~2.5GB  (text AI, fast)
└── SD model      ~2.0GB  (image AI)
```

---

## Publishing Flow

### Normal User (v1)

1. Generate Burmese + English content in app
2. Generate or pick an image
3. Copy text → paste into Facebook / Instagram
4. Use Facebook/Instagram's own scheduling if needed

### Advanced User (future — v2)

- Connect Meta API credentials (Facebook Page token + Instagram Business token)
- One-click publish directly from the app
- Requires user to set up their own Meta developer app (documented in app)

---

## Data Storage

All data is local. No cloud, no sync, no accounts needed.

| Data                         | Storage                         |
| ---------------------------- | ------------------------------- |
| Post history                 | SQLite                          |
| Custom templates             | SQLite                          |
| Brand profile (logo, colors) | SQLite + local file refs        |
| Image library                | Local file refs in SQLite       |
| AI models                    | Ollama model dir + SD model dir |
| App settings                 | JSON                            |

---

## App Details

| Item              | Decision                                |
| ----------------- | --------------------------------------- |
| App name          | open-myanmar-content                    |
| Platforms         | macOS + Windows (v1)                    |
| Framework         | Electrobun (Bun runtime)                |
| UI language       | Bilingual — Burmese + English           |
| Brand profiles    | Single brand (v1), multi-brand v2       |
| Social accounts   | One per platform (v1)                   |
| Cost to user      | Free, open source                       |
| Internet required | Only when posting to Facebook/Instagram |

---

## What It Is NOT (v1 Scope)

- Not a social media scheduler (users schedule inside FB/IG natively)
- Not a video or audio tool (text + images only)
- Not a cloud service (everything local)
- Not multi-brand (one business per install)
- No one-click publish (Meta API is advanced user / v2 feature)
- No photo enhancement AI (import your own product photos, AI generates backgrounds only)
- No team collaboration or sync

---

## Why This Matters for Myanmar

Most content tools (Buffer, Hootsuite, Later, Canva) have:

- No Burmese language support
- No Myanmar traditional event templates
- Subscription costs that are high relative to Myanmar income levels
- Cloud-dependent (bad for unreliable internet)

Open Myanmar Content is the first tool built specifically for Myanmar SME marketing needs,
free, offline-capable, and bilingual.
