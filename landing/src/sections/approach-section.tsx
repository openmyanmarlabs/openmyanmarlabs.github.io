/**
 * ApproachSection — the four brand principles that guide every app.
 *
 * Clean grid of title + blurb cards, calm staggered reveal. All copy from
 * content.js (bilingual).
 *
 * Band: white (`--color-surface`) — alternates against the panel Apps section
 * above. Anchor id="approach" (nav + footer link here).
 */

import { useI18n } from "../i18n";
import { Card, Reveal } from "../shared-ui";

export function ApproachSection() {
  const { t } = useI18n();

  return (
    <section
      id="approach"
      style={{
        background: "var(--color-surface)",
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
        </Reveal>

        <Reveal
          stagger={0.08}
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
            gap: "var(--space-5)",
          }}
        >
          {t.approach.principles.map((principle) => (
            <Card
              key={principle.title}
              elevation="sm"
              radius="lg"
              padding="var(--space-6)"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
                height: "100%",
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
            </Card>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
