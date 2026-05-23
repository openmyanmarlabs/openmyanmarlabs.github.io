/**
 * AppsSection — content-driven app showcase gallery.
 *
 * Showcase, NOT a product page: each card carries a name (English, both langs),
 * a one-line tagline (translated) and a status Badge (live -> free/green,
 * soon -> soon/gray). No per-app feature depth.
 *
 * Daily Sales is featured: a larger, highlighted card spanning the grid with an
 * "Open app →" Button-link to its own landing (href from content).
 *
 * Band: panel (`--color-panel`) — alternates against the white Hero above and
 * the white Approach below. Anchor id="apps" (nav + footer link here).
 */

import { useI18n } from "../i18n";
import { Card, Badge, Button, Reveal } from "../shared-ui";
import type { BadgeVariant } from "../shared-ui";
import type { AppStatus, Content } from "../content";

type AppItem = Content["apps"]["items"][number];

const STATUS_VARIANT: Record<AppStatus, BadgeVariant> = {
  live: "free",
  soon: "soon",
};

function AppCard({ app, t }: { app: AppItem; t: Content }) {
  const { name, tagline, href, featured } = app;
  const status = app.status;
  const badgeVariant = STATUS_VARIANT[status] ?? "neutral";
  const badgeLabel = t.apps.badge[status];

  return (
    <Card
      elevation={featured ? "md" : "sm"}
      radius="lg"
      padding="var(--space-6)"
      style={{
        gridColumn: featured ? "1 / -1" : "auto",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
        height: "100%",
        ...(featured ? { borderColor: "var(--color-accent)" } : {}),
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
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
          {name}
        </h3>
        <Badge variant={badgeVariant}>{badgeLabel}</Badge>
      </div>

      <p
        style={{
          fontSize: "var(--text-body-size)",
          color: "var(--color-text-muted)",
          lineHeight: "var(--leading-body)",
          margin: 0,
          flex: 1,
        }}
      >
        {tagline}
      </p>

      {featured && href ? (
        <div>
          <Button as="a" href={href} variant="primary" size="md">
            {t.apps.openApp}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

export function AppsSection() {
  const { t } = useI18n();

  return (
    <section
      id="apps"
      style={{
        background: "var(--color-panel)",
        padding: "var(--space-9) var(--space-5)",
      }}
    >
      <div style={{ maxWidth: "var(--content-max)", margin: "0 auto" }}>
        <Reveal>
          <header
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
              maxWidth: "42ch",
              marginBottom: "var(--space-8)",
            }}
          >
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

        <Reveal
          stagger={0.08}
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "var(--space-5)",
          }}
        >
          {t.apps.items.map((app) => (
            <AppCard key={app.name} app={app} t={t} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
