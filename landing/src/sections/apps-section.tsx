/**
 * AppsSection — the lineup, presented as an editorial index.
 *
 * A showcase, not a product page: each app carries a name (English, both langs),
 * a translated one-line tagline and a status (live -> free/green, soon -> gray).
 *
 * Design: an "editorial index" of the growing collection. Every app is a
 * catalogue entry with a monogram that morphs into the brand gradient, a hairline
 * "in-progress" meter, and a cursor-following spotlight — the signature
 * interaction. Daily Sales (live) sits up top as a wide feature tile with an
 * Open-app CTA; the upcoming apps form the index grid below. Deliberately distinct
 * from the Hero (which previews Daily Sales as a mock app) so the two read as
 * tease -> catalogue, not a repeat.
 *
 * Band: panel (`--color-panel`) — alternates against the white Hero above and the
 * white Approach below. Anchor id="apps" (nav + footer link here).
 *
 * Motion: header rule wipes in; tiles reveal staggered; the live dot pulses; on
 * hover each tile lifts, its monogram fills with gradient, the meter sweeps, and
 * the spotlight tracks the pointer. Every animation is gated on
 * useReducedMotion() — static surface, no pulse, no spotlight, no lift.
 */

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useI18n } from "../i18n";
import { Badge, Button, Reveal } from "../shared-ui";
import type { BadgeVariant } from "../shared-ui";
import type { AppStatus, Content } from "../content";

type AppItem = Content["apps"]["items"][number];

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const STATUS_VARIANT: Record<AppStatus, BadgeVariant> = {
  live: "free",
  soon: "soon",
};

const STATUS_DOT: Record<AppStatus, string> = {
  live: "var(--color-success)",
  soon: "var(--color-text-muted)",
};

/** Compact monogram from the app name (e.g. "Daily Sales" -> "DS"). */
function monogram(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 2).map((w) => w[0] ?? "");
  return initials.join("").toUpperCase() || name.slice(0, 2).toUpperCase();
}

/* ---------------------------------------------------------------------------
   Cursor-following spotlight — a soft accent glow that tracks the pointer
   across a surface. The signature micro-interaction; gated for reduced-motion.
   --------------------------------------------------------------------------- */
function useSpotlight(reduced: boolean | null, size = 280) {
  const mx = useMotionValue(-size);
  const my = useMotionValue(-size);
  const [hovered, setHovered] = useState(false);
  const background = useMotionTemplate`radial-gradient(${size}px circle at ${mx}px ${my}px, var(--color-accent-tint), transparent 60%)`;

  const onMouseMove = (event: ReactMouseEvent<HTMLElement>) => {
    if (reduced) return;
    const r = event.currentTarget.getBoundingClientRect();
    mx.set(event.clientX - r.left);
    my.set(event.clientY - r.top);
  };

  return { background, hovered, setHovered, onMouseMove };
}

/** Glow layer rendered inside a spotlight surface (skipped when reduced). */
function Spotlight({
  background,
  hovered,
}: {
  background: ReturnType<typeof useMotionTemplate>;
  hovered: boolean;
}) {
  return (
    <motion.span
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        background,
        pointerEvents: "none",
      }}
      animate={{ opacity: hovered ? 1 : 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    />
  );
}

/* ---------------------------------------------------------------------------
   Status pill + pulsing live dot.
   --------------------------------------------------------------------------- */
function StatusBadge({
  status,
  label,
  reduced,
}: {
  status: AppStatus;
  label: string;
  reduced: boolean | null;
}) {
  const isLive = status === "live";
  return (
    <Badge variant={STATUS_VARIANT[status] ?? "neutral"}>
      <span
        style={{
          position: "relative",
          display: "inline-flex",
          width: 6,
          height: 6,
          marginInlineEnd: "var(--space-1)",
        }}
      >
        {isLive && !reduced ? (
          <motion.span
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "var(--radius-pill)",
              background: STATUS_DOT[status],
            }}
            animate={{ scale: [1, 2.6, 1], opacity: [0.5, 0, 0] }}
            transition={{
              duration: 2,
              ease: "easeOut",
              repeat: Infinity,
              repeatDelay: 0.4,
            }}
          />
        ) : null}
        <span
          style={{
            position: "relative",
            width: 6,
            height: 6,
            borderRadius: "var(--radius-pill)",
            background: STATUS_DOT[status],
          }}
        />
      </span>
      {label}
    </Badge>
  );
}

/* ---------------------------------------------------------------------------
   Monogram — neutral chip that fills with the brand gradient when active
   (always on for the featured tile; on hover for index cards).
   --------------------------------------------------------------------------- */
function Monogram({
  name,
  active,
  size = 44,
}: {
  name: string;
  active: boolean;
  size?: number;
}) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "relative",
        display: "grid",
        placeItems: "center",
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        background: "var(--color-panel)",
        border: "1px solid var(--color-hairline)",
      }}
    >
      <motion.span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--gradient-brand)",
        }}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
      />
      <span
        style={{
          position: "relative",
          fontFamily: "var(--font-display)",
          fontSize:
            size >= 56 ? "var(--text-h3-size)" : "var(--text-body-size)",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: active
            ? "var(--color-text-on-dark)"
            : "var(--color-text-muted)",
          transition: "color var(--duration-micro) var(--ease-standard)",
        }}
      >
        {monogram(name)}
      </span>
    </span>
  );
}

/* ---------------------------------------------------------------------------
   Featured tile — the live app, a wide editorial entry with an Open-app CTA.
   --------------------------------------------------------------------------- */
function FeatureTile({
  app,
  t,
  reduced,
}: {
  app: AppItem;
  t: Content;
  reduced: boolean | null;
}) {
  const spot = useSpotlight(reduced, 460);

  return (
    <motion.article
      onMouseMove={spot.onMouseMove}
      onHoverStart={() => spot.setHovered(true)}
      onHoverEnd={() => spot.setHovered(false)}
      whileHover={reduced ? undefined : { y: -4 }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "var(--radius-xl)",
        background: "var(--color-surface)",
        border: "1px solid var(--color-accent)",
        boxShadow: "var(--elevation-md)",
        padding: "var(--space-7) var(--space-6)",
      }}
    >
      {/* Static corner wash (always present), then the cursor spotlight on top. */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 140% at 100% 0%, rgba(0,113,227,0.10), rgba(0,113,227,0.02) 40%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      {!reduced ? (
        <Spotlight background={spot.background} hovered={spot.hovered} />
      ) : null}
      {/* Accent edge on the leading side. */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          insetBlock: 0,
          insetInlineStart: 0,
          width: 3,
          background:
            "linear-gradient(180deg, var(--color-accent), rgba(0,113,227,0.35))",
          pointerEvents: "none",
        }}
      />

      <div
        className="oml-apps-feature"
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          gap: "var(--space-6)",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
            minWidth: 0,
          }}
        >
          <StatusBadge
            status={app.status}
            label={t.apps.badge[app.status]}
            reduced={reduced}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-4)",
            }}
          >
            <Monogram name={app.name} active size={56} />
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-h1-size)",
                fontWeight: "var(--text-h1-weight)",
                lineHeight: "var(--leading-heading)",
                letterSpacing: "var(--tracking-display)",
                margin: 0,
              }}
            >
              {app.name}
            </h3>
          </div>

          <p
            style={{
              fontSize: "var(--text-h3-size)",
              fontWeight: 400,
              color: "var(--color-text-muted)",
              lineHeight: "var(--leading-body)",
              margin: 0,
              maxWidth: "46ch",
            }}
          >
            {app.tagline}
          </p>
        </div>

        {app.href ? (
          <div className="oml-apps-feature-cta" style={{ flexShrink: 0 }}>
            <Button as="a" href={app.href} variant="primary" size="md">
              {t.apps.openApp}
            </Button>
          </div>
        ) : null}
      </div>
    </motion.article>
  );
}

/* ---------------------------------------------------------------------------
   Index card — an upcoming app entry. Hover: lift + gradient monogram + meter
   sweep + spotlight.
   --------------------------------------------------------------------------- */
function IndexCard({
  app,
  t,
  reduced,
}: {
  app: AppItem;
  t: Content;
  reduced: boolean | null;
}) {
  const spot = useSpotlight(reduced, 280);

  return (
    <motion.article
      onMouseMove={spot.onMouseMove}
      onHoverStart={() => spot.setHovered(true)}
      onHoverEnd={() => spot.setHovered(false)}
      whileHover={
        reduced ? undefined : { y: -4, boxShadow: "var(--elevation-md)" }
      }
      transition={{ duration: 0.25, ease: EASE_OUT }}
      style={{
        position: "relative",
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-5)",
        borderRadius: "var(--radius-lg)",
        background: "var(--color-surface)",
        border: "1px solid var(--color-hairline)",
        boxShadow: "var(--elevation-sm)",
        padding: "var(--space-6)",
      }}
    >
      {!reduced ? (
        <Spotlight background={spot.background} hovered={spot.hovered} />
      ) : null}

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-3)",
        }}
      >
        <Monogram name={app.name} active={spot.hovered && !reduced} />
        <StatusBadge
          status={app.status}
          label={t.apps.badge[app.status]}
          reduced={reduced}
        />
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
          flex: 1,
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
          {app.name}
        </h3>
        <p
          style={{
            fontSize: "var(--text-body-size)",
            color: "var(--color-text-muted)",
            lineHeight: "var(--leading-body)",
            margin: 0,
          }}
        >
          {app.tagline}
        </p>
      </div>

      {/* In-progress meter — sweeps to full on hover, hinting "on the way". */}
      <div
        aria-hidden="true"
        style={{
          position: "relative",
          height: 3,
          borderRadius: "var(--radius-pill)",
          background: "var(--color-hairline)",
          overflow: "hidden",
        }}
      >
        <motion.span
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: "left",
            borderRadius: "var(--radius-pill)",
            background: "var(--gradient-brand)",
          }}
          initial={false}
          animate={{ scaleX: reduced ? 0.25 : spot.hovered ? 1 : 0.25 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
        />
      </div>
    </motion.article>
  );
}

export function AppsSection() {
  const { t } = useI18n();
  const reduced = useReducedMotion();

  const items = t.apps.items;
  const featured = items.find((app) => app.featured);
  const rest = items.filter((app) => !app.featured);

  return (
    <section
      id="apps"
      style={{
        position: "relative",
        background: "var(--color-panel)",
        padding: "var(--space-9) var(--space-5)",
        overflow: "hidden",
      }}
    >
      {/* Faint atmospheric wash, top-right. */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-10%",
          insetInlineEnd: "-5%",
          width: "min(60vw, 640px)",
          height: "min(60vw, 640px)",
          background:
            "radial-gradient(circle, rgba(0,113,227,0.06), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          maxWidth: "var(--content-max)",
          margin: "0 auto",
        }}
      >
        <Reveal>
          <header
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
              maxWidth: "44ch",
              marginBottom: "var(--space-8)",
            }}
          >
            <motion.span
              aria-hidden="true"
              style={{
                display: "block",
                width: 56,
                height: 2,
                borderRadius: 2,
                transformOrigin: "left",
                background: "var(--gradient-brand)",
              }}
              initial={reduced ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, ease: EASE_OUT }}
            />
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
              {t.apps.title}
            </h2>
            <p
              style={{
                fontSize: "var(--text-h3-size)",
                color: "var(--color-text-muted)",
                lineHeight: "var(--leading-body)",
                margin: 0,
              }}
            >
              {t.apps.subtitle}
            </p>
          </header>
        </Reveal>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-5)",
          }}
        >
          {featured ? (
            <Reveal>
              <FeatureTile app={featured} t={t} reduced={reduced} />
            </Reveal>
          ) : null}

          <Reveal
            stagger={0.08}
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap: "var(--space-5)",
            }}
          >
            {rest.map((app) => (
              <IndexCard key={app.name} app={app} t={t} reduced={reduced} />
            ))}
          </Reveal>
        </div>
      </div>

      {/* Responsive: stack the feature tile's CTA below its copy on narrow. */}
      <style>{`
        @media (max-width: 720px) {
          .oml-apps-feature {
            grid-template-columns: 1fr !important;
          }
          .oml-apps-feature-cta {
            justify-self: start;
          }
        }
      `}</style>
    </section>
  );
}
