/**
 * Footer — deeper-ink page foot.
 *
 * Section-rhythm: this is the DEEPER INK band (#0b0e11) closing the page after
 * the accent CTA. The page's quiet close — motion is especially restrained here.
 *
 * Layout: brand mark + tagline (left), auto-fit link columns (Apps / Company)
 * (right) over a generous gap, then a top-hairline base row with the
 * copyright line. Columns collapse to a stacked layout on narrow viewports.
 *
 * Bilingual: all copy (brand, tagline, rights, columns) comes from i18n; column
 * link hrefs already point at the section anchors (#apps, #approach, #cta,
 * #daily-sales) and are preserved as-is. The brand mark doubles as a quiet
 * back-to-top (anchors to #top).
 *
 * Motion (all reduced-motion-safe):
 *   - One quiet staggered Reveal lifts the brand block + columns in on scroll.
 *   - Column links shift to accent-on-dark and grow a hairline underline on
 *     hover/focus (mirrors the nav link micro-interaction, on-dark palette).
 * Under reduced-motion the Reveal is inert and the CSS transitions are dropped.
 *
 * No anchor id needed (nothing scrolls to the footer).
 *
 * Note: a back-to-top affordance was considered (optional in the phase spec) but
 * dropped — it would need a new visible/aria label, and content.ts is frozen
 * (no `footer.backToTop` key), so introducing one would either hardcode a
 * user-facing string or edit frozen copy. The brand mark links to #top instead.
 */

import type { MouseEvent } from "react";
import { Reveal } from "../shared-ui";
import { useI18n } from "../i18n";

const LOGO_SRC = "/openmyanmarlabs-icon.svg";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Brand mark doubles as a quiet back-to-top. There's no `#top` element on the
// page (the nav brand + skip link target it the same way), so scroll to the
// document top explicitly, honoring reduced-motion. Mirrors the nav handler.
function handleTopClick(event: MouseEvent<HTMLAnchorElement>) {
  if (event.defaultPrevented) return;
  if (typeof window === "undefined") return;
  event.preventDefault();
  window.scrollTo({
    top: 0,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
  if (typeof history !== "undefined") {
    history.replaceState(null, "", "#top");
  }
}

export function Footer() {
  const { t } = useI18n();
  const { brand, tagline, rights, columns } = t.footer;
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "var(--color-ink-deeper)",
        color: "var(--color-text-on-dark)",
        padding: "var(--space-9) var(--space-5) var(--space-7)",
      }}
    >
      <div
        style={{
          maxWidth: "var(--content-max)",
          margin: "0 auto",
        }}
      >
        {/* Quiet staggered reveal: brand block, then each link column. */}
        <Reveal
          stagger={0.08}
          y={16}
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(220px, 1.5fr) repeat(auto-fit, minmax(150px, 1fr))",
            gap: "var(--space-7)",
            alignItems: "start",
          }}
        >
          {/* Brand + tagline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
            }}
          >
            <a
              className="oml-footer-brand"
              href="#top"
              onClick={handleTopClick}
              aria-label={brand}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-3)",
                textDecoration: "none",
                alignSelf: "flex-start",
              }}
            >
              <img
                src={LOGO_SRC}
                alt=""
                aria-hidden="true"
                width={30}
                height={30}
                style={{
                  borderRadius: "var(--radius-sm)",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-h3-size)",
                  fontWeight: "var(--text-display-weight)",
                  letterSpacing: "var(--tracking-display)",
                  color: "var(--color-text-on-dark)",
                }}
              >
                {brand}
              </span>
            </a>
            <p
              style={{
                fontSize: "var(--text-small-size)",
                lineHeight: "var(--leading-body)",
                color: "var(--color-text-muted-on-dark)",
                margin: 0,
                maxWidth: "34ch",
              }}
            >
              {tagline}
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col, i) => (
            <nav
              key={i}
              aria-label={col.title}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-4)",
              }}
            >
              <span
                style={{
                  fontSize: "var(--text-caption-size)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--color-text-muted-on-dark)",
                }}
              >
                {col.title}
              </span>
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-3)",
                }}
              >
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a
                      className="oml-footer-link"
                      href={link.href}
                      style={{
                        position: "relative",
                        display: "inline-block",
                        fontSize: "var(--text-small-size)",
                        color: "var(--color-text-on-dark)",
                        textDecoration: "none",
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </Reveal>

        {/* Base row: top-hairline copyright line. */}
        <div
          style={{
            marginTop: "var(--space-8)",
            paddingTop: "var(--space-5)",
            borderTop: "1px solid var(--color-hairline-on-dark)",
            fontSize: "var(--text-caption-size)",
            color: "var(--color-text-muted-on-dark)",
          }}
        >
          © {year} {brand}. {rights}
        </div>
      </div>

      {/* Scoped styles: on-dark link micro-interactions.
          - Column links shift to accent-on-dark and grow a hairline underline
            from the start on hover/focus (mirrors the nav link pattern).
          - Brand mark (links to #top) lifts its opacity on hover.
          All transitions drop under reduced-motion. */}
      <style>{`
        .oml-footer-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -2px;
          height: 1px;
          width: 100%;
          background: var(--color-accent-on-dark);
          border-radius: var(--radius-pill);
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform var(--duration-micro) var(--ease-standard);
        }
        .oml-footer-link {
          transition: color var(--duration-micro) var(--ease-standard);
        }
        .oml-footer-link:hover,
        .oml-footer-link:focus-visible {
          color: var(--color-accent-on-dark);
        }
        .oml-footer-link:hover::after,
        .oml-footer-link:focus-visible::after {
          transform: scaleX(1);
        }
        .oml-footer-brand {
          opacity: 0.92;
          transition: opacity var(--duration-micro) var(--ease-standard);
        }
        .oml-footer-brand:hover,
        .oml-footer-brand:focus-visible {
          opacity: 1;
        }
        @media (prefers-reduced-motion: reduce) {
          .oml-footer-link::after,
          .oml-footer-link,
          .oml-footer-brand { transition: none; }
        }
      `}</style>
    </footer>
  );
}
