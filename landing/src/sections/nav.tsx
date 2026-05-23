/**
 * Nav — sticky, translucent top bar (sits over the white hero).
 *
 * Logo + brand · section anchor links (#apps, #approach) · EN/မြန်မာ language
 * toggle (drives i18n) · "Get notified" primary pill (smooth-scrolls to #cta).
 *
 * All copy from content.js via i18n — no hardcoded strings. Backdrop-blur
 * translucency; collapses to logo + toggle + CTA on small screens (the section
 * links hide). Smooth-scroll honors reduced-motion (browser respects the user
 * setting; we pass behavior:"smooth" but anchors still work without it).
 */

import type { MouseEvent } from "react";
import { Button } from "../shared-ui";
import { useI18n } from "../i18n";

const LOGO_SRC = "/openmyanmarlabs-icon.svg";

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
  const { t, toggleLang } = useI18n();
  const nav = t.nav;

  const links = [
    { label: nav.apps, hash: "#apps" },
    { label: nav.approach, hash: "#approach" },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255, 255, 255, 0.72)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderBottom: "1px solid var(--color-hairline)",
      }}
    >
      <nav
        aria-label={nav.logoAlt}
        style={{
          maxWidth: "var(--content-max)",
          margin: "0 auto",
          padding: "var(--space-3) var(--space-5)",
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
                href={link.hash}
                onClick={(e) => handleAnchorClick(e, link.hash)}
                style={{
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

        {/* Right cluster: language toggle + Get notified.
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
          <button
            type="button"
            onClick={toggleLang}
            aria-label={nav.langToggle}
            style={{
              cursor: "pointer",
              background: "transparent",
              border: "1px solid var(--color-hairline)",
              borderRadius: "var(--radius-pill)",
              color: "var(--color-text)",
              padding: "var(--space-2) var(--space-4)",
              fontSize: "var(--text-small-size)",
              fontWeight: 500,
              lineHeight: 1,
              transition:
                "background-color var(--duration-fast) var(--ease-standard)",
            }}
          >
            {nav.langToggle}
          </button>

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
      </nav>

      {/* Collapse section links on narrow viewports; the actions cluster
          (toggle + CTA) always stays. Scoped class names avoid leaking. */}
      <style>{`
        @media (max-width: 720px) {
          .oml-nav-links { display: none !important; }
        }
      `}</style>
    </header>
  );
}
