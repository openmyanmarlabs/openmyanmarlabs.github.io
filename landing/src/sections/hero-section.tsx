/**
 * HeroSection — top of the page, white surface (rhythm starts white).
 *
 * Bilingual brand statement (display serif, fluid hero size) + subtitle, a
 * primary CTA that smooth-scrolls to #cta, and a FLOATING CLUSTER of app-icon
 * tiles built from t.apps.items: Daily Sales (featured + status "live") is lit
 * as Live (accent ring, elevated, "Live" dot); the rest are muted.
 *
 * Motion: calm entrance via Reveal (staggered). A gentle perpetual float on the
 * tiles — both disabled under reduced-motion (Reveal goes inert; the float is
 * gated on a useReducedMotion check). All copy from content.js via i18n.
 */

import { motion, useReducedMotion } from "motion/react";
import type { MouseEvent } from "react";
import { Button, Reveal } from "../shared-ui";
import { useI18n } from "../i18n";
import type { Content } from "../content";

type AppItem = Content["apps"]["items"][number];

const LOGO_SRC = "/openmyanmarlabs-icon.svg";

// Smooth-scroll to an in-page anchor; honors reduced-motion (snaps instead).
function scrollToHash(
  event: MouseEvent<HTMLAnchorElement>,
  hash: string,
  prefersReduced: boolean | null,
) {
  event.preventDefault();
  const el =
    typeof document !== "undefined" ? document.querySelector(hash) : null;
  if (el)
    el.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
    });
}

// First two letters of the app name → compact tile glyph.
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

interface AppTileProps {
  item: AppItem;
  liveLabel: string;
  soonLabel: string;
  prefersReduced: boolean | null;
  index: number;
}

function AppTile({
  item,
  liveLabel,
  soonLabel,
  prefersReduced,
  index,
}: AppTileProps) {
  const isLive = item.status === "live";

  const inner = (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        padding: "var(--space-4)",
        width: "100%",
        height: "100%",
        background: "var(--color-surface)",
        border: isLive
          ? "1px solid var(--color-accent)"
          : "1px solid var(--color-hairline)",
        borderRadius: "var(--radius-lg)",
        boxShadow: isLive ? "var(--elevation-float)" : "var(--elevation-sm)",
        opacity: isLive ? 1 : 0.62,
      }}
    >
      {/* App glyph */}
      <div
        style={{
          width: 40,
          height: 40,
          display: "grid",
          placeItems: "center",
          borderRadius: "var(--radius-md)",
          background: isLive ? "var(--gradient-brand)" : "var(--color-panel)",
          color: isLive
            ? "var(--color-text-on-dark)"
            : "var(--color-text-muted)",
          fontWeight: 600,
          fontSize: "var(--text-small-size)",
          letterSpacing: "0.02em",
        }}
        aria-hidden="true"
      >
        {initials(item.name)}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-1)",
        }}
      >
        <span
          style={{
            fontSize: "var(--text-small-size)",
            fontWeight: 600,
            color: "var(--color-text)",
          }}
        >
          {item.name}
        </span>

        {/* Status pill */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-1)",
            alignSelf: "flex-start",
            fontSize: "var(--text-caption-size)",
            fontWeight: 500,
            color: isLive ? "var(--color-success)" : "var(--color-text-muted)",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "var(--radius-pill)",
              background: isLive
                ? "var(--color-success)"
                : "var(--color-text-muted)",
            }}
            aria-hidden="true"
          />
          {isLive ? liveLabel : soonLabel}
        </span>
      </div>
    </div>
  );

  // Perpetual soft float — gentle, offset per tile. Inert under reduced-motion.
  if (prefersReduced) {
    return <div style={{ width: "100%", height: "100%" }}>{inner}</div>;
  }

  return (
    <motion.div
      style={{ width: "100%", height: "100%" }}
      animate={{ y: [0, -8, 0] }}
      transition={{
        duration: 4 + (index % 3),
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.35,
      }}
    >
      {inner}
    </motion.div>
  );
}

export function HeroSection() {
  const { t } = useI18n();
  const prefersReduced = useReducedMotion();
  const hero = t.hero;
  const apps = t.apps;

  return (
    <section
      id="top"
      style={{
        position: "relative",
        background: "var(--color-surface)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: "var(--content-max)",
          margin: "0 auto",
          padding: "var(--space-9) var(--space-5)",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 0.95fr)",
          gap: "var(--space-8)",
          alignItems: "center",
        }}
        className="oml-hero-grid"
      >
        {/* Copy column */}
        <Reveal stagger={0.12} y={20}>
          <p
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
              fontSize: "var(--text-caption-size)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-text-muted)",
              marginBottom: "var(--space-5)",
            }}
          >
            <img
              src={LOGO_SRC}
              alt=""
              width={20}
              height={20}
              style={{ borderRadius: "var(--radius-sm)" }}
              aria-hidden="true"
            />
            {hero.eyebrow}
          </p>

          <h1
            style={{
              fontSize: "var(--text-hero)",
              letterSpacing: "var(--tracking-display)",
              lineHeight: "var(--leading-heading)",
              marginBottom: "var(--space-5)",
              maxWidth: "16ch",
            }}
          >
            {hero.title}
          </h1>

          <p
            style={{
              fontSize: "var(--text-h3-size)",
              fontWeight: 400,
              color: "var(--color-text-muted)",
              lineHeight: "var(--leading-body)",
              maxWidth: "52ch",
              marginBottom: "var(--space-6)",
            }}
          >
            {hero.subtitle}
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--space-3)",
            }}
          >
            <Button
              variant="primary"
              size="lg"
              as="a"
              href="#cta"
              onClick={(e: MouseEvent<HTMLAnchorElement>) =>
                scrollToHash(e, "#cta", prefersReduced)
              }
            >
              {hero.primaryCta}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              as="a"
              href="#apps"
              onClick={(e: MouseEvent<HTMLAnchorElement>) =>
                scrollToHash(e, "#apps", prefersReduced)
              }
            >
              {hero.secondaryCta}
            </Button>
          </div>
        </Reveal>

        {/* Floating app-tile cluster */}
        <Reveal delay={0.2} y={28}>
          <div
            className="oml-hero-cluster"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "var(--space-4)",
            }}
            role="presentation"
          >
            {apps.items.map((item, i) => (
              <AppTile
                key={item.name}
                item={item}
                index={i}
                liveLabel={apps.badge.live}
                soonLabel={apps.badge.soon}
                prefersReduced={prefersReduced}
              />
            ))}
          </div>
        </Reveal>
      </div>

      {/* Responsive: stack columns + collapse cluster to a single column on
          narrow screens so the hero reflows cleanly. */}
      <style>{`
        @media (max-width: 860px) {
          .oml-hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .oml-hero-cluster {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
