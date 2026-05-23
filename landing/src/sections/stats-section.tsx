/**
 * StatsSection — dark credibility strip.
 *
 * Section-rhythm: this is the INK band (#0f1216) before the accent CTA.
 * Four big tabular-numeral stats animate up (CountUp) when scrolled into view;
 * under reduced-motion they snap to the final value (handled inside CountUp).
 * Copy (title / subtitle / items) comes entirely from i18n content.
 *
 * Anchor: id="stats".
 *
 * StatTile / CountUp hardcode their colors to `var(--color-text)` /
 * `var(--color-text-muted)`. Rather than fight that, we re-point those two
 * custom properties to the on-dark palette on the section wrapper, so every
 * descendant (tiles, labels, numerals) resolves to dark-surface colors.
 */

import type { CSSProperties, ReactNode } from "react";
import { StatTile, CountUp, Reveal } from "../shared-ui";
import { useI18n } from "../i18n";

/**
 * Map a stat value string to a CountUp node where a clean numeric animation
 * works; otherwise render the string statically. Never crashes on non-numeric.
 *   "2+"    -> count 2,  suffix "+"
 *   "25k+"  -> count 25, suffix "k+"
 *   "100%"  -> count 100, suffix "%"
 *   "1 → 6" -> no single number -> static string
 */
function renderStatValue(value: string): ReactNode {
  const text = String(value);

  // "1 → 6" and friends: contains an arrow / multiple numbers -> static.
  if (text.includes("→") || text.includes("->")) return text;

  const match = text.match(/^(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return text;

  const num = Number(match[1]);
  if (!Number.isFinite(num)) return text;

  const decimals = match[1].includes(".") ? match[1].split(".")[1].length : 0;
  const suffix = match[2] || null;

  return <CountUp to={num} decimals={decimals} suffix={suffix} />;
}

export function StatsSection() {
  const { t } = useI18n();
  const { title, subtitle, items } = t.stats;

  return (
    <section
      id="stats"
      style={
        {
          // Re-point the text tokens to the on-dark palette for all descendants.
          "--color-text": "var(--color-text-on-dark)",
          "--color-text-muted": "var(--color-text-muted-on-dark)",
          background: "var(--color-ink)",
          color: "var(--color-text-on-dark)",
          padding: "var(--space-9) var(--space-5)",
        } as CSSProperties
      }
    >
      <div
        style={{
          maxWidth: "var(--content-max)",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-7)",
        }}
      >
        <Reveal stagger={0.08}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-section)",
              fontWeight: "var(--text-display-weight)",
              lineHeight: "var(--leading-heading)",
              letterSpacing: "var(--tracking-display)",
              color: "var(--color-text-on-dark)",
              margin: 0,
              maxWidth: "20ch",
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontSize: "var(--text-h3-size)",
              lineHeight: "var(--leading-body)",
              color: "var(--color-text-muted-on-dark)",
              margin: "var(--space-3) 0 0",
              maxWidth: "52ch",
            }}
          >
            {subtitle}
          </p>
        </Reveal>

        <Reveal
          as="ul"
          stagger={0.1}
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "var(--space-6)",
          }}
        >
          {items.map((item, i) => (
            <li key={i}>
              <StatTile
                label={item.label}
                value={renderStatValue(item.value)}
              />
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
