import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import type { CSSProperties, MouseEvent } from "react";
import { Button } from "../shared-ui";
import { useI18n } from "../i18n";
import type { Content } from "../content";

type AppItem = Content["apps"]["items"][number];

const LOGO_SRC = "/openmyanmarlabs-icon.svg";
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// Decorative bar-chart heights (% of track) for the Daily Sales preview — the
// last bar is "today", lit with the brand gradient. Not data; illustrative only.
const BARS = [34, 50, 42, 61, 54, 73, 96] as const;

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

/* ---------------------------------------------------------------------------
   Atmospheric canvas — aurora blobs + masked dot-grid. Decorative, aria-hidden.
   --------------------------------------------------------------------------- */
function Canvas({
  prefersReduced,
  auroraY,
}: {
  prefersReduced: boolean | null;
  auroraY: ReturnType<typeof useSpring> | number;
}) {
  const blob: CSSProperties = {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(60px)",
    pointerEvents: "none",
  };

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: "-10% -5% 0",
        pointerEvents: "none",
        y: prefersReduced ? 0 : auroraY,
      }}
    >
      {/* Dot-grid, faded toward the edges. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at center, var(--color-hairline) 0.9px, transparent 1px)",
          backgroundSize: "26px 26px",
          opacity: 0.55,
          WebkitMaskImage:
            "radial-gradient(125% 90% at 72% 28%, #000 0%, transparent 72%)",
          maskImage:
            "radial-gradient(125% 90% at 72% 28%, #000 0%, transparent 72%)",
        }}
      />
      {/* Blue aurora (cluster side). */}
      <motion.div
        style={{
          ...blob,
          top: "-6%",
          right: "4%",
          width: "46vw",
          height: "46vw",
          maxWidth: 620,
          maxHeight: 620,
          background:
            "radial-gradient(circle, rgba(0,113,227,0.22), transparent 68%)",
        }}
        animate={prefersReduced ? undefined : { x: [0, 26, 0], y: [0, -22, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Green aurora (copy side, lower). */}
      <motion.div
        style={{
          ...blob,
          top: "34%",
          left: "-6%",
          width: "40vw",
          height: "40vw",
          maxWidth: 540,
          maxHeight: 540,
          background:
            "radial-gradient(circle, rgba(52,199,89,0.16), transparent 68%)",
        }}
        animate={prefersReduced ? undefined : { x: [0, -22, 0], y: [0, 20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

/* ---------------------------------------------------------------------------
   Headline — word-by-word de-blur + rise. No clip masks (Myanmar-safe).
   --------------------------------------------------------------------------- */
function AnimatedHeadline({
  text,
  prefersReduced,
}: {
  text: string;
  prefersReduced: boolean | null;
}) {
  const style: CSSProperties = {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(44px, 5.6vw + 1rem, 104px)",
    fontWeight: 600,
    letterSpacing: "var(--tracking-display)",
    lineHeight: 1.04,
    margin: "var(--space-5) 0",
    maxWidth: "17ch",
    color: "var(--color-text)",
  };

  if (prefersReduced) return <h1 style={style}>{text}</h1>;

  const tokens = text.split(/(\s+)/); // keep whitespace → identical wrapping

  return (
    <motion.h1
      style={style}
      initial="hidden"
      animate="shown"
      variants={{
        hidden: {},
        shown: { transition: { delayChildren: 0.26, staggerChildren: 0.04 } },
      }}
    >
      {tokens.map((tok, i) =>
        /\s+/.test(tok) ? (
          <span key={i}>{tok}</span>
        ) : (
          <motion.span
            key={i}
            style={{ display: "inline-block", willChange: "transform, filter" }}
            variants={{
              hidden: { opacity: 0, y: "0.45em", filter: "blur(10px)" },
              shown: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 0.65, ease: EASE_OUT },
              },
            }}
          >
            {tok}
          </motion.span>
        ),
      )}
    </motion.h1>
  );
}

/* ---------------------------------------------------------------------------
   Featured live app — a mini "Daily Sales" preview with a rising bar-chart.
   --------------------------------------------------------------------------- */
function FeaturedPreview({
  app,
  liveLabel,
  prefersReduced,
}: {
  app: AppItem;
  liveLabel: string;
  prefersReduced: boolean | null;
}) {
  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.45, type: "spring", stiffness: 240, damping: 24 }}
      whileHover={prefersReduced ? undefined : { y: -6 }}
      style={{
        position: "relative",
        background: "var(--color-surface)",
        border: "1px solid var(--color-hairline)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--elevation-float)",
        padding: "var(--space-5)",
        overflow: "hidden",
        willChange: "transform",
      }}
    >
      {/* Accent wash + halo. */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(420px 200px at 85% -10%, var(--color-accent-tint), transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: -1,
          borderRadius: "var(--radius-xl)",
          boxShadow: "0 0 0 4px var(--color-accent-tint)",
          pointerEvents: "none",
        }}
      />

      {/* Window chrome */}
      <div
        aria-hidden="true"
        style={{ display: "flex", gap: 6, marginBottom: "var(--space-4)" }}
      >
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <span
            key={c}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: c,
              opacity: 0.9,
            }}
          />
        ))}
      </div>

      {/* App header */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          marginBottom: "var(--space-5)",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 44,
            height: 44,
            display: "grid",
            placeItems: "center",
            borderRadius: "var(--radius-md)",
            background: "var(--gradient-brand)",
            color: "var(--color-text-on-dark)",
            fontWeight: 700,
            fontSize: "var(--text-small-size)",
            letterSpacing: "0.02em",
            boxShadow: "var(--elevation-sm)",
          }}
        >
          {initials(app.name)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span
            style={{
              fontWeight: 600,
              fontSize: "var(--text-body-size)",
              color: "var(--color-text)",
            }}
          >
            {app.name}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-1)",
              fontSize: "var(--text-caption-size)",
              fontWeight: 600,
              color: "var(--color-success)",
            }}
          >
            <LiveDot prefersReduced={prefersReduced} />
            {liveLabel}
          </span>
        </div>
      </div>

      {/* Rising bar-chart — the "daily sales" climbing. */}
      <div
        aria-hidden="true"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
          gap: "var(--space-2)",
          height: 132,
          padding: "0 var(--space-1)",
        }}
      >
        {BARS.map((h, i) => {
          const isLast = i === BARS.length - 1;
          return (
            <motion.div
              key={i}
              initial={prefersReduced ? false : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{
                delay: 0.7 + i * 0.07,
                duration: 0.55,
                ease: EASE_OUT,
              }}
              style={{
                flex: 1,
                height: `${h}%`,
                transformOrigin: "bottom",
                borderRadius: "var(--radius-sm) var(--radius-sm) 0 0",
                background: isLast
                  ? "var(--gradient-brand)"
                  : "var(--color-accent-tint)",
                boxShadow: isLast ? "var(--elevation-sm)" : "none",
                willChange: "transform",
              }}
            />
          );
        })}
      </div>

      {/* Tagline */}
      <p
        style={{
          position: "relative",
          margin: "var(--space-4) 0 0",
          fontSize: "var(--text-small-size)",
          lineHeight: "var(--leading-body)",
          color: "var(--color-text-muted)",
        }}
      >
        {app.tagline}
      </p>
    </motion.div>
  );
}

// Pulsing live dot (gated). Shared by the chip + preview header.
function LiveDot({ prefersReduced }: { prefersReduced: boolean | null }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "relative",
        display: "inline-grid",
        placeItems: "center",
        width: 7,
        height: 7,
      }}
    >
      {!prefersReduced && (
        <motion.span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "var(--radius-pill)",
            background: "var(--color-success)",
          }}
          animate={{ scale: [1, 2.8, 2.8], opacity: [0.55, 0, 0] }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: "easeOut",
            times: [0, 0.6, 1],
          }}
        />
      )}
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "var(--radius-pill)",
          background: "var(--color-success)",
        }}
      />
    </span>
  );
}

/* ---------------------------------------------------------------------------
   Marquee — full-bleed, slowly drifting row of the upcoming ("soon") apps.
   --------------------------------------------------------------------------- */
function UpcomingChip({ app, soonLabel }: { app: AppItem; soonLabel: string }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-3) var(--space-5)",
        background: "var(--color-surface)",
        border: "1px solid var(--color-hairline)",
        borderRadius: "var(--radius-pill)",
        boxShadow: "var(--elevation-sm)",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 30,
          height: 30,
          display: "grid",
          placeItems: "center",
          borderRadius: "var(--radius-sm)",
          background: "var(--color-panel)",
          color: "var(--color-text-muted)",
          fontWeight: 600,
          fontSize: "var(--text-caption-size)",
        }}
      >
        {initials(app.name)}
      </span>
      <span
        style={{
          fontSize: "var(--text-small-size)",
          fontWeight: 600,
          color: "var(--color-text)",
        }}
      >
        {app.name}
      </span>
      <span
        style={{
          fontSize: "var(--text-caption-size)",
          fontWeight: 500,
          color: "var(--color-text-muted)",
          borderInlineStart: "1px solid var(--color-hairline)",
          paddingInlineStart: "var(--space-3)",
        }}
      >
        {soonLabel}
      </span>
    </div>
  );
}

function Marquee({
  apps,
  soonLabel,
  prefersReduced,
}: {
  apps: AppItem[];
  soonLabel: string;
  prefersReduced: boolean | null;
}) {
  const row = (ariaHidden: boolean) => (
    <div
      aria-hidden={ariaHidden || undefined}
      style={{
        display: "flex",
        gap: "var(--space-4)",
        paddingInlineEnd: "var(--space-4)",
      }}
    >
      {apps.map((app) => (
        <UpcomingChip key={app.name} app={app} soonLabel={soonLabel} />
      ))}
    </div>
  );

  // Reduced-motion: a single static, wrapping row (no loop).
  if (prefersReduced) {
    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--space-4)",
          justifyContent: "center",
          padding: "0 var(--space-5)",
        }}
      >
        {apps.map((app) => (
          <UpcomingChip key={app.name} app={app} soonLabel={soonLabel} />
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        // Full-bleed: break out of the centered content container.
        width: "100vw",
        marginInlineStart: "calc(50% - 50vw)",
        overflow: "hidden",
        // Soft fade at both edges.
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
        maskImage:
          "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
      }}
    >
      <motion.div
        style={{
          display: "flex",
          width: "max-content",
          willChange: "transform",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, x: ["0%", "-50%"] }}
        transition={{
          opacity: { delay: 0.8, duration: 0.6 },
          x: { duration: 32, repeat: Infinity, ease: "linear" },
        }}
      >
        {row(false)}
        {row(true)}
      </motion.div>
    </div>
  );
}

/* --------------------------------------------------------------------------- */

export function HeroSection() {
  const { t } = useI18n();
  const prefersReduced = useReducedMotion();
  const hero = t.hero;
  const apps = t.apps;

  const liveApp = apps.items.find((a) => a.status === "live") ?? apps.items[0];
  const soonApps = apps.items.filter((a) => a.status !== "live");

  // Scroll parallax: showcase rises, aurora sinks. Gated → no movement.
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const showcaseY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -70]), {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });
  const auroraY = useSpring(useTransform(scrollYProgress, [0, 1], [0, 90]), {
    stiffness: 90,
    damping: 30,
    mass: 0.5,
  });

  // Entrance helper for the copy-side blocks (gated).
  const enter = (delay: number) =>
    prefersReduced
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.6, ease: EASE_OUT },
        };

  return (
    <section
      id="top"
      ref={sectionRef}
      style={{
        position: "relative",
        background: "var(--color-surface)",
        overflow: "hidden",
        paddingBottom: "var(--space-8)",
      }}
    >
      <Canvas prefersReduced={prefersReduced} auroraY={auroraY} />

      <div
        style={{
          position: "relative",
          maxWidth: "var(--content-max)",
          margin: "0 auto",
          padding: "var(--space-9) var(--space-5) var(--space-7)",
        }}
      >
        {/* Eyebrow row: accent rule + brand + live status pill. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "var(--space-4)",
          }}
        >
          <motion.span
            aria-hidden="true"
            style={{
              display: "block",
              width: 56,
              height: 2,
              transformOrigin: "left",
              borderRadius: 2,
              background: "var(--gradient-brand)",
            }}
            initial={prefersReduced ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          />
          <motion.p
            {...enter(0.1)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
              fontSize: "var(--text-caption-size)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--color-text-muted)",
              margin: 0,
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
          </motion.p>

          {/* Live status pill — composed from frozen copy. */}
          <motion.span
            {...enter(0.18)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
              padding: "var(--space-1) var(--space-3)",
              fontSize: "var(--text-caption-size)",
              fontWeight: 600,
              color: "var(--color-text)",
              background: "var(--color-success-tint)",
              border: "1px solid var(--color-hairline)",
              borderRadius: "var(--radius-pill)",
            }}
          >
            <LiveDot prefersReduced={prefersReduced} />
            {liveApp.name} · {apps.badge.live}
          </motion.span>
        </div>

        {/* Headline */}
        <AnimatedHeadline text={hero.title} prefersReduced={prefersReduced} />

        {/* Lower region: copy/CTAs (left) + featured preview (right). */}
        <div
          className="oml-hero-lower"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 0.86fr)",
            gap: "var(--space-8)",
            alignItems: "center",
            marginTop: "var(--space-4)",
          }}
        >
          <div>
            <motion.p
              {...enter(0.58)}
              style={{
                fontSize: "var(--text-h3-size)",
                fontWeight: 400,
                color: "var(--color-text-muted)",
                lineHeight: "var(--leading-body)",
                maxWidth: "52ch",
                margin: "0 0 var(--space-6)",
              }}
            >
              {hero.subtitle}
            </motion.p>

            <motion.div
              {...enter(0.7)}
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
            </motion.div>
          </div>

          {/* Featured preview rides the scroll parallax. */}
          <motion.div style={{ y: prefersReduced ? 0 : showcaseY }}>
            <FeaturedPreview
              app={liveApp}
              liveLabel={apps.badge.live}
              prefersReduced={prefersReduced}
            />
          </motion.div>
        </div>
      </div>

      {/* Full-bleed upcoming-apps marquee. */}
      <div style={{ position: "relative", marginTop: "var(--space-7)" }}>
        <Marquee
          apps={soonApps}
          soonLabel={apps.badge.soon}
          prefersReduced={prefersReduced}
        />
      </div>

      {/* Responsive: stack the lower region on narrow screens. */}
      <style>{`
        @media (max-width: 860px) {
          .oml-hero-lower {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
