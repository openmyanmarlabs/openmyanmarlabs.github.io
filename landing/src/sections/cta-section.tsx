/**
 * CtaSection — the page's single conversion goal: "Get notified" waitlist.
 *
 * Section-rhythm: this is the ACCENT BAND (--gradient-cta) between the ink stats
 * strip and the deeper-ink footer.
 *
 * Anchor: id="cta" — the nav "Get notified" button and the footer "Get notified"
 * link both scroll here, so this id is load-bearing.
 *
 * VISUAL-ONLY / NO-OP: this is a pitch-demo waitlist. Submitting does NOT hit any
 * backend, capture, or network — `handleSubmit` only calls `preventDefault()` and
 * flips a local success flag to show `t.cta.success`. Intentionally no fetch.
 *
 * Copy (title / subtitle / placeholder / button / success) comes from i18n.
 */

import { useState } from "react";
import type { FormEvent } from "react";
import { Button, Reveal } from "../shared-ui";
import { useI18n } from "../i18n";

export function CtaSection() {
  const { t } = useI18n();
  const { title, subtitle, placeholder, button, success } = t.cta;
  const [submitted, setSubmitted] = useState(false);

  // Visual-only: no backend, no network call. Pitch demo — just show success.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section
      id="cta"
      style={{
        background: "var(--gradient-cta)",
        color: "var(--color-text-on-dark)",
        padding: "var(--space-9) var(--space-5)",
      }}
    >
      <Reveal
        stagger={0.08}
        style={{
          maxWidth: "640px",
          margin: "0 auto",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-4)",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-section)",
            fontWeight: "var(--text-display-weight)",
            lineHeight: "var(--leading-heading)",
            letterSpacing: "var(--tracking-display)",
            color: "var(--color-text-on-dark)",
            margin: 0,
          }}
        >
          {title}
        </h2>

        <p
          style={{
            fontSize: "var(--text-h3-size)",
            lineHeight: "var(--leading-body)",
            color: "var(--color-text-on-dark)",
            opacity: 0.85,
            margin: 0,
            maxWidth: "48ch",
          }}
        >
          {subtitle}
        </p>

        {submitted ? (
          <p
            role="status"
            style={{
              marginTop: "var(--space-3)",
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
              background: "rgba(255, 255, 255, 0.16)",
              border: "1px solid rgba(255, 255, 255, 0.28)",
              borderRadius: "var(--radius-pill)",
              padding: "var(--space-3) var(--space-5)",
              fontSize: "var(--text-body-size)",
              color: "var(--color-text-on-dark)",
            }}
          >
            {success}
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              marginTop: "var(--space-3)",
              width: "100%",
              maxWidth: "440px",
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--space-3)",
              justifyContent: "center",
            }}
          >
            <input
              type="email"
              required
              name="email"
              placeholder={placeholder}
              aria-label={placeholder}
              style={{
                flex: "1 1 220px",
                minWidth: 0,
                padding: "var(--space-3) var(--space-5)",
                fontSize: "var(--text-body-size)",
                color: "var(--color-text)",
                background: "var(--color-surface)",
                border: "1px solid rgba(255, 255, 255, 0.4)",
                borderRadius: "var(--radius-pill)",
                outline: "none",
              }}
            />
            <Button type="submit" variant="secondary" size="md">
              {button}
            </Button>
          </form>
        )}
      </Reveal>
    </section>
  );
}
