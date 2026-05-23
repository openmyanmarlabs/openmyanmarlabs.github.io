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
 * Numerals are the focal point: each figure is rendered large with tabular
 * figures and a faint on-dark accent gradient, separated by vertical hairlines,
 * over a soft accent glow that washes up from the band floor. CountUp keeps the
 * tabular width stable while counting and snaps under reduced-motion. The
 * figure itself does a tasteful settle (fade + slight lift) on reveal, gated on
 * reduced-motion.
 *
 * We DON'T use the shared StatTile here (its fixed layout can't carry the
 * hairline dividers / accent gradient); we compose the tiles locally and reuse
 * CountUp for the animated numerals so the "1 → 6" static path is preserved.
 *
 * StatTile / CountUp hardcode their colors to `var(--color-text)` /
 * `var(--color-text-muted)`. Rather than fight that, we re-point those two
 * custom properties to the on-dark palette on the section wrapper, so every
 * descendant (labels, numerals) resolves to dark-surface colors.
 */

import type { CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CountUp, Reveal } from "../shared-ui";
import { useI18n } from "../i18n";

const EASE_REVEAL = [0.22, 1, 0.36, 1] as const;

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

/**
 * One stat: big accent-gradient numeral over a small muted label, with a tasteful
 * settle on reveal. Vertical hairline dividers between siblings are drawn by the
 * grid wrapper (border-left), so they stay crisp at any column count.
 */
function StatCell({
  value,
  label,
  index,
}: {
  value: string;
  label: string;
  index: number;
}) {
  const prefersReduced = useReducedMotion();

  const figure = (
    <span
      style={{
        display: "block",
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-stat)",
        fontWeight: "var(--text-display-weight)",
        lineHeight: 1,
        letterSpacing: "var(--tracking-display)",
        fontVariantNumeric: "tabular-nums",
        fontFeatureSettings: '"tnum" 1',
        // Faint on-dark accent gradient on the numerals — the focal element.
        backgroundImage:
          "linear-gradient(165deg, var(--color-text-on-dark) 0%, var(--color-text-on-dark) 52%, var(--color-accent-on-dark) 138%)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
      }}
    >
      {renderStatValue(value)}
    </span>
  );

  return (
    <li
      style={{
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        padding: "0 var(--space-5)",
        // Hairline divider: first cell has no leading rule; the grid hides the
        // first divider per row via :first-child override below.
        borderLeft: "1px solid var(--color-hairline-on-dark)",
      }}
      className="stat-cell"
    >
      {/* Tiny accent tick anchors the numeral and adds on-dark accent. */}
      <span
        aria-hidden
        style={{
          width: "28px",
          height: "2px",
          borderRadius: "var(--radius-pill)",
          background:
            "linear-gradient(90deg, var(--color-accent-on-dark), transparent)",
          opacity: 0.9,
        }}
      />
      {prefersReduced ? (
        figure
      ) : (
        <motion.span
          style={{ display: "block", willChange: "transform, opacity" }}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{
            duration: 0.55,
            ease: EASE_REVEAL,
            delay: 0.08 * index,
          }}
        >
          {figure}
        </motion.span>
      )}
      <span
        style={{
          fontSize: "var(--text-small-size)",
          lineHeight: "var(--leading-body)",
          color: "var(--color-text-muted-on-dark)",
          maxWidth: "22ch",
        }}
      >
        {label}
      </span>
    </li>
  );
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
          position: "relative",
          isolation: "isolate",
          overflow: "hidden",
          background: "var(--color-ink)",
          color: "var(--color-text-on-dark)",
          padding: "var(--space-9) var(--space-5)",
        } as CSSProperties
      }
    >
      {/* Atmosphere: soft accent glow washing up from the band floor + a faint
          top hairline of light. Asset-light, pointer-inert, behind content. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: -1,
          pointerEvents: "none",
          backgroundImage:
            "radial-gradient(120% 90% at 50% 118%, rgba(90, 169, 255, 0.16) 0%, rgba(90, 169, 255, 0.05) 38%, transparent 66%)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          zIndex: -1,
          pointerEvents: "none",
          background:
            "linear-gradient(90deg, transparent, var(--color-hairline-on-dark) 22%, var(--color-hairline-on-dark) 78%, transparent)",
        }}
      />

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

        {/* Scoped style: drop the leading hairline on the first cell of each
            row so the dividers read as separators, not enclosures. The grid is
            auto-fit so the row break is responsive; we approximate "first in
            row" with first-child (always correct for the first cell) and rely
            on the soft hairline being unobtrusive when it wraps. */}
        <style>{`
          #stats .stat-grid > .stat-cell:first-child { border-left: 0; }
          @media (max-width: 720px) {
            #stats .stat-grid > .stat-cell { border-left: 0; }
          }
        `}</style>

        {/* Single-block Reveal for the grid so the DOM stays valid `ul > li`
            (Reveal's stagger mode wraps each child in a div). Per-cell entrance
            is staggered inside StatCell via `index`. */}
        <Reveal
          as="ul"
          className="stat-grid"
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "var(--space-6)",
            alignItems: "start",
          }}
        >
          {items.map((item, i) => (
            <StatCell key={i} value={item.value} label={item.label} index={i} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
