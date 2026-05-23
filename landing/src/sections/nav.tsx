/**
 * Nav — sticky, translucent top bar (sits over the white hero).
 *
 * Logo + brand · section anchor links (#apps, #approach) · sliding EN/မြန်မာ
 * language Switch (drives i18n) · "Get notified" primary pill (smooth-scrolls
 * to #cta).
 *
 * All copy from content.ts via i18n — no hardcoded strings. The two toggle
 * endonyms ("EN" / "မြန်မာ") are read from BOTH content objects so the Switch
 * always shows both, and the wider Burmese label sizes the control symmetrically.
 *
 * Scroll-aware: at the top the bar is airy + barely-there; once the page
 * scrolls it tightens (less vertical padding), the blur/translucency firms up
 * and a hairline + soft shadow settle in — the calm Apple "the bar noticed you
 * scrolled" cue. Section links grow an accent underline on hover. Both the
 * scroll response and the underline collapse to static under reduced-motion.
 *
 * Backdrop-blur translucency; collapses to logo + Switch + CTA on small screens
 * (the section links hide). Smooth-scroll honors reduced-motion.
 */

import type { MouseEvent } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { Button, Switch } from "../shared-ui";
import { content } from "../content";
import { useI18n } from "../i18n";

const LOGO_SRC = "/openmyanmarlabs-icon.svg";

// Both toggle endonyms, read straight from the two language objects so neither
// is hardcoded and content.ts stays frozen. labelLeft = EN, labelRight = မြန်မာ.
const LABEL_EN = content.my.nav.langToggle; // "EN"
const LABEL_MY = content.en.nav.langToggle; // "မြန်မာ"

// Scroll distance over which the bar settles from "airy" to "tight".
const SETTLE_DISTANCE = 80; // px

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function smoothScrollTo(hash: string): void {
  if (typeof document === "undefined") return;
  const el = document.querySelector(hash);
  if (!el) return;
  el.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
}

function handleAnchorClick(event: MouseEvent<HTMLAnchorElement>, hash: string) {
  // Let modifier-clicks / middle-clicks behave natively.
  if (event.defaultPrevented) return;
  event.preventDefault();
  smoothScrollTo(hash);
  if (typeof history !== "undefined") {
    history.replaceState(null, "", hash);
  }
}

export function Nav() {
  const { t, lang, toggleLang } = useI18n();
  const nav = t.nav;
  const prefersReduced = useReducedMotion();

  // Page scroll → bar "settle" progress (0 at top, 1 once scrolled past
  // SETTLE_DISTANCE). Drives translucency, blur, hairline and shadow.
  const { scrollY } = useScroll();
  const settle = useTransform(scrollY, [0, SETTLE_DISTANCE], [0, 1], {
    clamp: true,
  });
  const background = useTransform(
    settle,
    [0, 1],
    ["rgba(255, 255, 255, 0.62)", "rgba(255, 255, 255, 0.82)"],
  );
  const blur = useTransform(settle, [0, 1], [12, 22]);
  const backdropFilter = useTransform(
    blur,
    (b) => `saturate(180%) blur(${b}px)`,
  );
  const borderColor = useTransform(
    settle,
    [0, 1],
    ["rgba(210, 210, 215, 0)", "rgba(210, 210, 215, 1)"],
  );
  const boxShadow = useTransform(
    settle,
    [0, 1],
    ["0 0 0 rgba(0, 0, 0, 0)", "0 1px 12px rgba(0, 0, 0, 0.06)"],
  );
  // Vertical padding tightens as the bar settles (24px → 12px).
  const padV = useTransform(settle, [0, 1], [24, 12]);
  const paddingTop = useTransform(padV, (p) => `${p}px`);
  const paddingBottom = paddingTop;

  // Under reduced-motion the bar is static at its "settled" resting state —
  // no scroll-driven shrink/translucency animation.
  const headerStyle = prefersReduced
    ? {
        background: "rgba(255, 255, 255, 0.82)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderBottom: "1px solid var(--color-hairline)",
      }
    : {
        background,
        backdropFilter,
        WebkitBackdropFilter: backdropFilter,
        borderBottom: "1px solid transparent",
        borderBottomColor: borderColor,
        boxShadow,
      };

  const navPadding = prefersReduced
    ? { paddingTop: "var(--space-3)", paddingBottom: "var(--space-3)" }
    : { paddingTop, paddingBottom };

  const links = [
    { label: nav.apps, hash: "#apps" },
    { label: nav.approach, hash: "#approach" },
  ];

  return (
    <motion.header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        ...headerStyle,
      }}
    >
      <motion.nav
        aria-label={nav.logoAlt}
        style={{
          maxWidth: "var(--content-max)",
          margin: "0 auto",
          paddingInline: "var(--space-5)",
          ...navPadding,
          display: "flex",
          alignItems: "center",
          gap: "var(--space-5)",
        }}
      >
        {/* Brand */}
        <a
          href="#top"
          onClick={(e) => handleAnchorClick(e, "#top")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            color: "var(--color-text)",
            fontWeight: 600,
            fontSize: "var(--text-h3-size)",
            flexShrink: 0,
          }}
        >
          <img
            src={LOGO_SRC}
            alt={nav.logoAlt}
            width={28}
            height={28}
            style={{ borderRadius: "var(--radius-sm)" }}
          />
          <span>{nav.logoAlt}</span>
        </a>

        {/* Section links — hidden on small screens via CSS below. */}
        <ul
          className="oml-nav-links"
          style={{
            listStyle: "none",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-5)",
            margin: 0,
            marginInlineStart: "auto",
          }}
        >
          {links.map((link) => (
            <li key={link.hash}>
              <a
                className="oml-nav-link"
                href={link.hash}
                onClick={(e) => handleAnchorClick(e, link.hash)}
                style={{
                  position: "relative",
                  color: "var(--color-text)",
                  fontSize: "var(--text-small-size)",
                  fontWeight: 500,
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right cluster: language Switch + Get notified.
            marginInlineStart:auto kicks in when the links list is hidden
            (mobile), keeping this cluster pinned to the end. */}
        <div
          className="oml-nav-actions"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            marginInlineStart: "auto",
            flexShrink: 0,
          }}
        >
          {/* Myanmar-first: checked = my → thumb on the right (မြန်မာ active).
              Both labels render so the wider Burmese endonym sizes the track. */}
          <Switch
            checked={lang === "my"}
            onChange={toggleLang}
            labelLeft={LABEL_EN}
            labelRight={LABEL_MY}
            ariaLabel={nav.langToggle}
          />

          <Button
            variant="primary"
            size="sm"
            as="a"
            href="#cta"
            onClick={(e: MouseEvent<HTMLAnchorElement>) =>
              handleAnchorClick(e, "#cta")
            }
          >
            {nav.cta}
          </Button>
        </div>
      </motion.nav>

      {/* Scoped styles:
          - Collapse section links on narrow viewports; the actions cluster
            (Switch + CTA) always stays.
          - Animated accent underline grows from the link's start on hover /
            focus. Under reduced-motion it appears instantly (no grow). */}
      <style>{`
        .oml-nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -4px;
          height: 1.5px;
          width: 100%;
          background: var(--color-accent);
          border-radius: var(--radius-pill);
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform var(--duration-micro) var(--ease-standard);
        }
        .oml-nav-link:hover { color: var(--color-accent); }
        .oml-nav-link:hover::after,
        .oml-nav-link:focus-visible::after {
          transform: scaleX(1);
        }
        @media (prefers-reduced-motion: reduce) {
          .oml-nav-link::after { transition: none; }
        }
        @media (max-width: 720px) {
          .oml-nav-links { display: none !important; }
        }
      `}</style>
    </motion.header>
  );
}
