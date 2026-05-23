/**
 * Footer — deeper-ink page foot.
 *
 * Section-rhythm: this is the DEEPER INK band (#0b0e11) closing the page after
 * the accent CTA.
 *
 * Brand + tagline on the left, link columns (Apps / Company) on the right.
 * Bilingual: all copy (brand, tagline, rights, columns) comes from i18n; column
 * link hrefs already point at the section anchors (#apps, #approach, #cta, ...).
 * Columns collapse to a stacked layout on narrow viewports (auto-fit grid).
 *
 * No anchor id needed (nothing scrolls to the footer).
 */

import { Reveal } from "../shared-ui";
import { useI18n } from "../i18n";

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
      <Reveal
        style={{
          maxWidth: "var(--content-max)",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-7)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(220px, 1.4fr) repeat(auto-fit, minmax(140px, 1fr))",
            gap: "var(--space-7)",
            alignItems: "start",
          }}
        >
          {/* Brand + tagline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-h2-size)",
                fontWeight: "var(--text-display-weight)",
                color: "var(--color-text-on-dark)",
              }}
            >
              {brand}
            </span>
            <p
              style={{
                fontSize: "var(--text-small-size)",
                lineHeight: "var(--leading-body)",
                color: "var(--color-text-muted-on-dark)",
                margin: 0,
                maxWidth: "36ch",
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
                gap: "var(--space-3)",
              }}
            >
              <span
                style={{
                  fontSize: "var(--text-caption-size)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
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
                  gap: "var(--space-2)",
                }}
              >
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a
                      href={link.href}
                      style={{
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
        </div>

        {/* Rights / copyright */}
        <div
          style={{
            borderTop: "1px solid var(--color-hairline-on-dark)",
            paddingTop: "var(--space-5)",
            fontSize: "var(--text-caption-size)",
            color: "var(--color-text-muted-on-dark)",
          }}
        >
          © {year} {brand}. {rights}
        </div>
      </Reveal>
    </footer>
  );
}
