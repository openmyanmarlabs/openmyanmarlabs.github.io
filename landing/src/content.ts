/**
 * content — bilingual copy. Myanmar-first.
 *
 * `en` and `my` MUST keep identical key trees; the i18n toggle just swaps which
 * object renders (content[lang], default "my"). Asymmetric keys = bug.
 *
 * Symmetry is enforced by types: `my` is the source of truth, `Content = typeof
 * my`, and `en` is typed `Content` — so missing/renamed/extra keys in `en` are a
 * compile error.
 *
 * Data shapes (read by section components, identical across en/my):
 *   apps.items[]  — { name, status, tagline, href?, featured? }
 *                   name stays English both langs; status is a stable enum
 *                   ("live" | "soon") the Badge maps; only tagline translates.
 *   approach.principles[] — { title, blurb }
 *   stats.items[]         — { value, label }  (value string kept as-is)
 *   footer.columns[]      — { title, links: [{ label, href }] }
 */

export type AppStatus = "live" | "soon";

const my = {
  nav: {
    logoAlt: "OpenMyanmarLabs",
    apps: "အက်ပ်များ",
    approach: "ချဉ်းကပ်ပုံ",
    cta: "အသိပေးပါ",
    langToggle: "EN",
    skipToContent: "အကြောင်းအရာသို့ ကျော်ရန်",
  },
  hero: {
    eyebrow: "OpenMyanmarLabs",
    title: "မြန်မာ့လုပ်ငန်းငယ်တွေအတွက် အခမဲ့၊ အင်တာနက်မလိုတဲ့ ဆော့ဖ်ဝဲ။",
    subtitle:
      "ဆိုင်၊ ဟိုတယ်၊ ကျောင်း၊ စားသောက်ဆိုင်နဲ့ ဆေးခန်းတွေအတွက် ရိုးရှင်းတဲ့ ကိရိယာတွေ ဆောက်ပေးပါတယ်။ အင်တာနက် ရှိရှိ မရှိရှိ သင့်ကိရိယာပေါ်မှာပဲ အလုပ်လုပ်ပါတယ်။",
    primaryCta: "အသိပေးပါ",
    secondaryCta: "အက်ပ်တွေ ကြည့်ရန်",
  },
  apps: {
    title: "ဓာတ်ခွဲခန်းတစ်ခု၊ တိုးများလာတဲ့ အက်ပ်တွေ။",
    subtitle:
      "အက်ပ်တစ်ခုစီက အလုပ်တစ်ခုကို ကောင်းကောင်းလုပ်ပါတယ်။ Daily Sales ကို အခု သုံးလို့ရပြီ၊ ကျန်တာတွေ မကြာခင် ထွက်လာပါမယ်။",
    openApp: "အက်ပ်ဖွင့်ရန် →",
    badge: { live: "သုံးလို့ရပြီ", soon: "မကြာခင်" },
    items: [
      {
        name: "Daily Sales",
        status: "live" as const satisfies AppStatus,
        tagline: "ဆိုင်ရဲ့ နေ့စဉ်ဝင်ငွေကို ယုံကြည်ရတဲ့ ဂဏန်းတစ်ခုနဲ့ မြင်ပါ။",
        href: "#daily-sales",
        featured: true,
      },
      {
        name: "Hotel Management",
        status: "soon" as const satisfies AppStatus,
        tagline: "အခန်း၊ ဘွတ်ကင်နဲ့ ဧည့်ကြိုကောင်တာ — Excel မလိုတော့ဘူး။",
      },
      {
        name: "School Management",
        status: "soon" as const satisfies AppStatus,
        tagline: "ကျောင်းသား၊ ကျောင်းလခနဲ့ တက်ရောက်မှု အားလုံး တစ်နေရာတည်း။",
      },
      {
        name: "Mini ERP",
        status: "soon" as const satisfies AppStatus,
        tagline: "ကြီးလာတဲ့ လုပ်ငန်းတွေအတွက် ကုန်ပစ္စည်း၊ ရောင်းအားနဲ့ စာရင်း။",
      },
      {
        name: "Restaurant POS",
        status: "soon" as const satisfies AppStatus,
        tagline:
          "မှာယူမှု၊ စားပွဲနဲ့ တစ်နေ့တာ စုစုပေါင်း — ကောင်တာမှာ မြန်မြန်ဆန်ဆန်။",
      },
      {
        name: "Clinic & Pharmacy",
        status: "soon" as const satisfies AppStatus,
        tagline: "လူနာ၊ ဆေးညွှန်းနဲ့ ဆေးလက်ကျန်ကို ရိုးရိုးရှင်းရှင်း ထိန်းပါ။",
      },
    ],
  },
  approach: {
    title: "အက်ပ်တိုင်းကို ဘယ်လို တည်ဆောက်လဲ။",
    subtitle:
      "အခြေခံမူ လေးချက်က အက်ပ်တိုင်းကို လမ်းညွှန်ပါတယ် — ဒါကြောင့် နောက်အက်ပ်တွေလည်း တူတူပဲ ယုံကြည်ရပါတယ်။",
    principles: [
      {
        title: "အခမဲ့ စတင်လို့ရ",
        blurb:
          "လုပ်ငန်းငယ်တွေအတွက် တကယ့်ကိရိယာတွေ အခမဲ့။ Cloud သုံးတဲ့ အပိုင်းတွေကိုတော့ ကြီးလာမှ ပေးရပါတယ်။",
      },
      {
        title: "အင်တာနက်မလိုတာ ဦးစားပေး",
        blurb:
          "အရာအားလုံး ကိရိယာပေါ်မှာ အလုပ်လုပ်ပြီး အင်တာနက်ပြန်ရမှ sync လုပ်ပါတယ် — မြန်မာမှာ အင်တာနက် မကြာခဏ ပြတ်တတ်လို့။",
      },
      {
        title: "သင်လုပ်တဲ့ နေရာကို ရောက်အောင်",
        blurb:
          "သင်တန်းမလို၊ စာရင်းကိုင် ဘွဲ့မလို။ အက်ပ်တိုင်းက ကောင်တာ၊ ဧည့်ကြိုနေရာ၊ စာသင်ခန်းနဲ့ ကိုက်ညီပါတယ်။",
      },
      {
        title: "ယုံကြည်မှုရယူ၊ ပြီးမှ တိုးချဲ့",
        blurb:
          "ဂဏန်းတစ်ခုကို အရင် မှန်အောင်လုပ်၊ ပြီးမှ နောက်တစ်ဆင့် တိုးပါတယ်။ feature မတိုင်ခင် ယုံကြည်မှု အရင်။",
      },
    ],
  },
  stats: {
    title: "မြန်မာတစ်ဝှမ်းက ပိုင်ရှင်တွေ ယုံကြည်ထားတယ်။",
    subtitle:
      "ဆိုင်တစ်ဆိုင်ချင်း တည်ဆောက်ထားတဲ့ မှတ်တမ်းနဲ့ ပွင့်လင်းတဲ့ လမ်းပြမြေပုံ။",
    items: [
      { value: "2+", label: "နှစ်ကြာ ငွေပေးသုံးသူတွေ" },
      { value: "25k+", label: "အသိုင်းအဝိုင်းထဲက ပိုင်ရှင်တွေ" },
      { value: "1 → 6", label: "ထွက်ပြီးနဲ့ လာမယ့် အက်ပ်တွေ" },
      { value: "100%", label: "အင်တာနက်မလိုအောင် ဒီဇိုင်းဆွဲ" },
    ],
  },
  cta: {
    title: "နောက်အက်ပ်ထွက်ရင် အရင်ဆုံး သိအောင်။",
    subtitle:
      "စောင့်စာရင်းမှာ ပါဝင်ထားပါ — သင့်လုပ်ငန်းအတွက် အက်ပ်အသစ် အသင့်ဖြစ်တာနဲ့ ချက်ချင်း အသိပေးပါမယ်။",
    placeholder: "you@example.com",
    button: "အသိပေးပါ",
    success: "စာရင်းထဲ ရောက်သွားပါပြီ။ ဆက်သွယ်ပါမယ်။",
  },
  footer: {
    brand: "OpenMyanmarLabs",
    tagline: "မြန်မာ့လုပ်ငန်းငယ်တွေအတွက် အခမဲ့၊ အင်တာနက်မလိုတဲ့ ဆော့ဖ်ဝဲ။",
    rights: "မူပိုင်ခွင့် အားလုံး ပိုင်ဆိုင်ပါတယ်။",
    columns: [
      {
        title: "အက်ပ်များ",
        links: [
          { label: "Daily Sales", href: "#daily-sales" },
          { label: "Hotel Management", href: "#apps" },
          { label: "School Management", href: "#apps" },
          { label: "Mini ERP", href: "#apps" },
          { label: "Restaurant POS", href: "#apps" },
          { label: "Clinic & Pharmacy", href: "#apps" },
        ],
      },
      {
        title: "ကုမ္ပဏီ",
        links: [
          { label: "ချဉ်းကပ်ပုံ", href: "#approach" },
          { label: "အသိပေးပါ", href: "#cta" },
        ],
      },
    ],
  },
};

/** Active-language content shape. `my` is the source of truth; `en` must match. */
export type Content = typeof my;

/** Supported languages. */
export type Lang = "en" | "my";

// `en` typed as `Content` → key-symmetric with `my` or it fails to compile.
const en: Content = {
  nav: {
    logoAlt: "OpenMyanmarLabs",
    apps: "Apps",
    approach: "Approach",
    cta: "Get notified",
    langToggle: "မြန်မာ",
    skipToContent: "Skip to content",
  },
  hero: {
    eyebrow: "OpenMyanmarLabs",
    title: "Free, offline-first software for Myanmar's small businesses.",
    subtitle:
      "We're a software lab building simple tools for the shops, hotels, schools, restaurants and clinics that run the local economy — made to work on the device, with or without a connection.",
    primaryCta: "Get notified",
    secondaryCta: "See the apps",
  },
  apps: {
    title: "One lab, a growing collection of apps.",
    subtitle:
      "Each app does one job well — a name, a one-line, and a status. Daily Sales is live today; the rest are on the way.",
    openApp: "Open app →",
    badge: { live: "Live", soon: "Coming soon" },
    items: [
      {
        name: "Daily Sales",
        status: "live",
        tagline: "See every shop's daily takings in one number you can trust.",
        href: "#daily-sales",
        featured: true,
      },
      {
        name: "Hotel Management",
        status: "soon",
        tagline:
          "Rooms, bookings and the front desk — without the spreadsheets.",
      },
      {
        name: "School Management",
        status: "soon",
        tagline: "Students, fees and attendance, all in one place.",
      },
      {
        name: "Mini ERP",
        status: "soon",
        tagline: "Inventory, sales and accounts for growing businesses.",
      },
      {
        name: "Restaurant POS",
        status: "soon",
        tagline: "Orders, tables and the day's total — at counter speed.",
      },
      {
        name: "Clinic & Pharmacy",
        status: "soon",
        tagline: "Patients, prescriptions and stock, kept simple.",
      },
    ],
  },
  approach: {
    title: "How we build, in every app.",
    subtitle:
      "The same four principles guide every tool we make — so the next app feels as trustworthy as the last.",
    principles: [
      {
        title: "Free to start",
        blurb:
          "Real tools, free for small businesses. You only pay when you grow into the parts that need the cloud.",
      },
      {
        title: "Offline-first",
        blurb:
          "Everything works on the device and syncs when you're back online — because connections drop in Myanmar.",
      },
      {
        title: "Meet you where you work",
        blurb:
          "No training, no bookkeeping degree. Each app fits the counter, the front desk, the classroom.",
      },
      {
        title: "Earn trust, then grow",
        blurb:
          "Get the one number right first, then earn the next step. Trust before features.",
      },
    ],
  },
  stats: {
    title: "Trusted by owners across Myanmar.",
    subtitle:
      "A track record built one shop at a time, and a roadmap built in the open.",
    items: [
      { value: "2+", label: "years of paying customers" },
      { value: "25k+", label: "owners in the community" },
      { value: "1 → 6", label: "apps live and on the way" },
      { value: "100%", label: "offline-first by design" },
    ],
  },
  cta: {
    title: "Be first to know when the next app lands.",
    subtitle:
      "Join the waitlist and we'll let you know the moment a new tool is ready for your business.",
    placeholder: "you@example.com",
    button: "Get notified",
    success: "You're on the list. We'll be in touch.",
  },
  footer: {
    brand: "OpenMyanmarLabs",
    tagline: "Free, offline-first software for Myanmar's small businesses.",
    rights: "All rights reserved.",
    columns: [
      {
        title: "Apps",
        links: [
          { label: "Daily Sales", href: "#daily-sales" },
          { label: "Hotel Management", href: "#apps" },
          { label: "School Management", href: "#apps" },
          { label: "Mini ERP", href: "#apps" },
          { label: "Restaurant POS", href: "#apps" },
          { label: "Clinic & Pharmacy", href: "#apps" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "Approach", href: "#approach" },
          { label: "Get notified", href: "#cta" },
        ],
      },
    ],
  },
};

export const content = { en, my };
