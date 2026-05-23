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
    cta: "အသိပေးချက်ရယူရန်",
    langToggle: "EN",
    skipToContent: "အကြောင်းအရာသို့ ကျော်သွားရန်",
  },
  hero: {
    eyebrow: "OpenMyanmarLabs",
    title:
      "မြန်မာ့လုပ်ငန်းငယ်များအတွက် အခမဲ့၊ အင်တာနက်မလိုဘဲ အလုပ်လုပ်သော ဆော့ဖ်ဝဲ။",
    subtitle:
      "ဒေသခံစီးပွားရေးကို မောင်းနှင်နေသော ဆိုင်များ၊ ဟိုတယ်များ၊ ကျောင်းများ၊ စားသောက်ဆိုင်များနှင့် ဆေးခန်းများအတွက် ရိုးရှင်းသော ကိရိယာများ တည်ဆောက်ပေးနေသည့် ဆော့ဖ်ဝဲဓာတ်ခွဲခန်းတစ်ခု ဖြစ်ပါသည် — အင်တာနက်ရှိသည်ဖြစ်စေ မရှိသည်ဖြစ်စေ ကိရိယာပေါ်တွင်ပင် အလုပ်လုပ်အောင် ဖန်တီးထားသည်။",
    primaryCta: "အသိပေးချက်ရယူရန်",
    secondaryCta: "အက်ပ်များ ကြည့်ရန်",
  },
  apps: {
    title: "ဓာတ်ခွဲခန်းတစ်ခု၊ တိုးပွားလာသော အက်ပ်စုစည်းမှု။",
    subtitle:
      "အက်ပ်တစ်ခုစီသည် တာဝန်တစ်ခုကို ကောင်းကောင်းလုပ်ဆောင်သည် — အမည်၊ တစ်ကြောင်းတည်းရှင်းလင်းချက်နှင့် အခြေအနေ။ Daily Sales ကို ယနေ့အသုံးပြုနိုင်ပြီဖြစ်ပြီး ကျန်အက်ပ်များ မကြာမီ ရောက်ရှိလာမည်။",
    openApp: "အက်ပ်ဖွင့်ရန် →",
    badge: { live: "အသုံးပြုနိုင်ပြီ", soon: "မကြာမီ" },
    items: [
      {
        name: "Daily Sales",
        status: "live" as const satisfies AppStatus,
        tagline:
          "ဆိုင်တိုင်း၏ နေ့စဉ်ဝင်ငွေကို ယုံကြည်စိတ်ချရသော ကိန်းဂဏန်းတစ်ခုတည်းဖြင့် မြင်ပါ။",
        href: "#daily-sales",
        featured: true,
      },
      {
        name: "Hotel Management",
        status: "soon" as const satisfies AppStatus,
        tagline: "အခန်းများ၊ ဘွတ်ကင်များနှင့် ဧည့်ကြိုကောင်တာ — Excel မလိုဘဲ။",
      },
      {
        name: "School Management",
        status: "soon" as const satisfies AppStatus,
        tagline:
          "ကျောင်းသားများ၊ ကျောင်းလခများနှင့် တက်ရောက်မှု အားလုံး တစ်နေရာတည်းတွင်။",
      },
      {
        name: "Mini ERP",
        status: "soon" as const satisfies AppStatus,
        tagline:
          "ကြီးထွားလာသော လုပ်ငန်းများအတွက် ကုန်ပစ္စည်း၊ ရောင်းအားနှင့် စာရင်းဇယား။",
      },
      {
        name: "Restaurant POS",
        status: "soon" as const satisfies AppStatus,
        tagline:
          "မှာယူမှုများ၊ စားပွဲများနှင့် တစ်နေ့တာ စုစုပေါင်း — ကောင်တာအလျင်အမြန်နှုန်းဖြင့်။",
      },
      {
        name: "Clinic & Pharmacy",
        status: "soon" as const satisfies AppStatus,
        tagline:
          "လူနာများ၊ ဆေးညွှန်းများနှင့် ဆေးပစ္စည်းလက်ကျန် — ရိုးရှင်းစွာ ထိန်းသိမ်းပါ။",
      },
    ],
  },
  approach: {
    title: "အက်ပ်တိုင်းတွင် ကျွန်ုပ်တို့ တည်ဆောက်ပုံ။",
    subtitle:
      "တူညီသော အခြေခံမူ လေးချက်က ကျွန်ုပ်တို့ ဖန်တီးသော ကိရိယာတိုင်းကို လမ်းညွှန်ပေးသည် — ဒါကြောင့် နောက်အက်ပ်သည်လည်း ယခင်အက်ပ်ကဲ့သို့ပင် ယုံကြည်စိတ်ချရသည်။",
    principles: [
      {
        title: "အခမဲ့ စတင်နိုင်",
        blurb:
          "လုပ်ငန်းငယ်များအတွက် တကယ့်ကိရိယာများ အခမဲ့။ Cloud လိုအပ်သော အပိုင်းများသို့ ကြီးထွားလာမှသာ ပေးချေရန် လိုသည်။",
      },
      {
        title: "အင်တာနက်မလိုဘဲ ဦးစားပေး",
        blurb:
          "အရာအားလုံး ကိရိယာပေါ်တွင် အလုပ်လုပ်ပြီး အင်တာနက်ပြန်ရသည့်အခါ sync လုပ်သည် — မြန်မာတွင် အင်တာနက် ပြတ်တောက်တတ်သောကြောင့်။",
      },
      {
        title: "သင်လုပ်ကိုင်ရာ နေရာသို့ ရောက်ရှိ",
        blurb:
          "သင်တန်းမလို၊ စာရင်းကိုင်ဘွဲ့ မလို။ အက်ပ်တိုင်းသည် ကောင်တာ၊ ဧည့်ကြိုနေရာ၊ စာသင်ခန်းနှင့် ကိုက်ညီသည်။",
      },
      {
        title: "ယုံကြည်မှုရယူ၊ ပြီးမှ တိုးချဲ့",
        blurb:
          "ကိန်းဂဏန်းတစ်ခုကို အရင်မှန်အောင်လုပ်၊ ပြီးမှ နောက်တစ်ဆင့်ကို ရယူသည်။ feature မတိုင်မီ ယုံကြည်မှု။",
      },
    ],
  },
  stats: {
    title: "မြန်မာတစ်ဝှမ်းရှိ ပိုင်ရှင်များ ယုံကြည်အားထား။",
    subtitle:
      "ဆိုင်တစ်ဆိုင်ချင်းစီဖြင့် တည်ဆောက်ထားသော မှတ်တမ်းနှင့် ပွင့်လင်းစွာ ရေးဆွဲထားသော လမ်းပြမြေပုံ။",
    items: [
      { value: "2+", label: "နှစ်ကြာ ပိုက်ဆံပေး ဖောက်သည်များ" },
      { value: "25k+", label: "အသိုင်းအဝိုင်းအတွင်း ပိုင်ရှင်များ" },
      { value: "1 → 6", label: "အသုံးပြုနိုင်ပြီ၊ လာမည့် အက်ပ်များ" },
      { value: "100%", label: "အင်တာနက်မလိုဘဲ ဒီဇိုင်းဆွဲထား" },
    ],
  },
  cta: {
    title: "နောက်အက်ပ်ရောက်လာသည့်အခါ ပထမဆုံး သိရှိပါ။",
    subtitle:
      "စောင့်ဆိုင်းစာရင်းတွင် ပါဝင်လိုက်ပါ — သင့်လုပ်ငန်းအတွက် ကိရိယာအသစ်တစ်ခု အသင့်ဖြစ်သည်နှင့် ချက်ချင်း အသိပေးပါမည်။",
    placeholder: "you@example.com",
    button: "အသိပေးချက်ရယူရန်",
    success: "စာရင်းတွင် ပါဝင်ပြီးပါပြီ။ ဆက်သွယ်ပါမည်။",
  },
  footer: {
    brand: "OpenMyanmarLabs",
    tagline:
      "မြန်မာ့လုပ်ငန်းငယ်များအတွက် အခမဲ့၊ အင်တာနက်မလိုဘဲ အလုပ်လုပ်သော ဆော့ဖ်ဝဲ။",
    rights: "မူပိုင်ခွင့် အားလုံး လက်ဝယ်ထားရှိသည်။",
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
          { label: "အသိပေးချက်ရယူရန်", href: "#cta" },
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
