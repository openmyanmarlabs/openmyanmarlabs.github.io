/**
 * ApproachSection — the four brand principles that guide every app.
 *
 * Editorial grid of numbered principle cards (index numeral + accent tick →
 * title → blurb), calm staggered reveal, opt-in hover-lift. The index numerals
 * use the display serif with tabular figures so the column reads like a
 * numbered manifesto. All copy from content.ts (bilingual, EN + MY).
 *
 * Band: white (`--color-surface`) — alternates against the panel Apps section
 * above. Anchor id="approach" (nav + footer link here).
 *
 * Motion: scroll reveal (staggered) + per-card hover — the Card `interactive`
 * lift plus a growing accent tick under the index numeral. All hover motion is
 * gated on useReducedMotion(); when reduced, cards/ticks render static.
 */

import { useState } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

import { useI18n } from "../i18n";
import { Card } from "../shared-ui";

const EASE_OUT_BACK = [0.18, 0.89, 0.32, 1.28] as const;

interface Principle {
  title: string;
  blurb: string;
}

/**
 * PrincipleCard — one numbered principle. Owns its hover state so the accent
 * tick can grow in concert with the Card's hover-lift. Reduced-motion: tick is
 * static and hover tracking is skipped.
 */
function PrincipleCard({
  principle,
  index,
}: {
  principle: Principle;
  index: number;
}) {
  const prefersReduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const hoverProps = prefersReduced
    ? {}
    : {
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
        onFocus: () => setHovered(true),
        onBlur: () => setHovered(false),
      };

  return (
    <Card
      interactive
      elevation="sm"
      radius="lg"
      padding="var(--space-6)"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
        height: "100%",
      }}
      {...hoverProps}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
        }}
      >
        <span
          aria-hidden
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "28px",
            fontWeight: "var(--text-h1-weight)",
            lineHeight: 1,
            letterSpacing: "var(--tracking-display)",
            color: "var(--color-accent)",
            fontVariantNumeric: "tabular-nums",
            fontFeatureSettings: '"tnum" 1',
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        {/* Accent tick — grows on hover (reduced-motion: fixed width). */}
        <motion.span
          aria-hidden
          initial={false}
          animate={{ width: prefersReduced ? 24 : hovered ? 40 : 20 }}
          transition={{ duration: 0.2, ease: EASE_OUT_BACK }}
          style={{
            display: "block",
            height: 2,
            borderRadius: "var(--radius-pill)",
            background: "var(--color-accent)",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        <h3
          style={{
            fontSize: "var(--text-h3-size)",
            fontWeight: "var(--text-h3-weight)",
            lineHeight: "var(--leading-heading)",
            margin: 0,
          }}
        >
          {principle.title}
        </h3>
        <p
          style={{
            fontSize: "var(--text-body-size)",
            color: "var(--color-text-muted)",
            lineHeight: "var(--leading-body)",
            margin: 0,
          }}
        >
          {principle.blurb}
        </p>
      </div>
    </Card>
  );
}

export function ApproachSection() {
  const { t } = useI18n();
  const prefersReduced = useReducedMotion();

  const EASE_REVEAL = [0.22, 1, 0.36, 1] as const;

  // Header + grid use one orchestrated stagger so the section reads as a single
  // calm reveal. Reduced-motion: render plain, fully visible (no transforms).
  if (prefersReduced) {
    return (
      <ApproachLayout>
        <ApproachHeader />
        <div style={GRID_STYLE}>
          {t.approach.principles.map((principle, index) => (
            <PrincipleCard
              key={principle.title}
              principle={principle}
              index={index}
            />
          ))}
        </div>
      </ApproachLayout>
    );
  }

  return (
    <ApproachLayout>
      <motion.div
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: {},
          shown: { transition: { staggerChildren: 0.1 } },
        }}
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 24 },
            shown: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.5, ease: EASE_REVEAL },
            },
          }}
        >
          <ApproachHeader />
        </motion.div>

        <div style={GRID_STYLE}>
          {t.approach.principles.map((principle, index) => (
            <motion.div
              key={principle.title}
              variants={{
                hidden: { opacity: 0, y: 28 },
                shown: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: EASE_REVEAL },
                },
              }}
              style={{ height: "100%" }}
            >
              <PrincipleCard principle={principle} index={index} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </ApproachLayout>
  );
}

const GRID_STYLE = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
  gap: "var(--space-5)",
  marginTop: "var(--space-8)",
} as const;

function ApproachLayout({ children }: { children: ReactNode }) {
  return (
    <section
      id="approach"
      style={{
        background: "var(--color-surface)",
        padding: "var(--space-9) var(--space-5)",
      }}
    >
      <div style={{ maxWidth: "var(--content-max)", margin: "0 auto" }}>
        {children}
      </div>
    </section>
  );
}

function ApproachHeader() {
  const { t } = useI18n();
  return (
    <header
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
        maxWidth: "42ch",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--space-2)",
          fontSize: "var(--text-caption-size)",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-accent)",
        }}
      >
        <span
          aria-hidden
          style={{
            width: 24,
            height: 1,
            background: "var(--color-accent)",
            display: "inline-block",
          }}
        />
        {t.nav.approach}
      </span>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-section)",
          fontWeight: "var(--text-h1-weight)",
          lineHeight: "var(--leading-heading)",
          letterSpacing: "var(--tracking-display)",
          margin: 0,
        }}
      >
        {t.approach.title}
      </h2>
      <p
        style={{
          fontSize: "var(--text-h3-size)",
          color: "var(--color-text-muted)",
          lineHeight: "var(--leading-body)",
          margin: 0,
        }}
      >
        {t.approach.subtitle}
      </p>
    </header>
  );
}
