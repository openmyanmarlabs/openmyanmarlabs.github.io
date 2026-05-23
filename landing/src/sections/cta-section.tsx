/**
 * CtaSection — the page's single conversion goal: "Get notified" waitlist.
 *
 * Section-rhythm: this is the ACCENT BAND (--gradient-cta) between the ink stats
 * strip and the deeper-ink footer. Decorated with a slow, atmospheric gradient
 * drift + soft glow orbs (depth, not noise) — all static under reduced-motion.
 *
 * Anchor: id="cta" — the nav "Get notified" button and the footer "Get notified"
 * link both scroll here, so this id is load-bearing.
 *
 * VISUAL-ONLY / NO-OP: this is a pitch-demo waitlist. Submitting does NOT hit any
 * backend, capture, or network — `handleSubmit` only calls `preventDefault()` and
 * flips a local success flag to show `t.cta.success`. Intentionally no fetch.
 *
 * Micro-interactions (all reduced-motion-safe):
 *  - input focus → soft ring + lift (state-driven; global :focus-visible still on top),
 *  - Button hover → built into the Button primitive,
 *  - submit → form cross-fades out, success card pops in with a checkmark draw.
 *
 * Copy (title / subtitle / placeholder / button / success) comes from i18n.
 */

import { useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button, Reveal } from "../shared-ui";
import { useI18n } from "../i18n";

const EASE_SPRING = [0.34, 1.56, 0.64, 1] as const;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function CtaSection() {
  const { t } = useI18n();
  const { title, subtitle, placeholder, button, success } = t.cta;
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(false);
  const prefersReduced = useReducedMotion();

  // Visual-only: no backend, no network call. Pitch demo — just show success.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section
      id="cta"
      style={{
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
        background: "var(--gradient-cta)",
        color: "var(--color-text-on-dark)",
        padding: "var(--space-9) var(--space-5)",
      }}
    >
      {/* Atmospheric layers — slow drifting gradient sheen + two soft glow orbs.
          Decorative only (aria-hidden); frozen to a still frame under reduced-motion. */}
      <motion.div
        aria-hidden
        initial={false}
        animate={
          prefersReduced
            ? undefined
            : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
        }
        transition={
          prefersReduced
            ? undefined
            : { duration: 18, ease: "linear", repeat: Infinity }
        }
        style={{
          position: "absolute",
          inset: 0,
          zIndex: -2,
          backgroundImage:
            "linear-gradient(120deg, rgba(90,169,255,0.55) 0%, rgba(10,132,255,0) 35%, rgba(10,91,191,0.5) 70%, rgba(90,169,255,0.45) 100%)",
          backgroundSize: "220% 220%",
          backgroundPosition: "0% 50%",
          mixBlendMode: "screen",
          opacity: 0.7,
        }}
      />
      <motion.div
        aria-hidden
        initial={false}
        animate={prefersReduced ? undefined : { x: [0, 24, 0], y: [0, -18, 0] }}
        transition={
          prefersReduced
            ? undefined
            : { duration: 14, ease: "easeInOut", repeat: Infinity }
        }
        style={{
          position: "absolute",
          top: "-12%",
          left: "8%",
          zIndex: -1,
          width: "min(46vw, 420px)",
          height: "min(46vw, 420px)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 68%)",
          filter: "blur(8px)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        aria-hidden
        initial={false}
        animate={prefersReduced ? undefined : { x: [0, -28, 0], y: [0, 20, 0] }}
        transition={
          prefersReduced
            ? undefined
            : { duration: 17, ease: "easeInOut", repeat: Infinity }
        }
        style={{
          position: "absolute",
          bottom: "-18%",
          right: "4%",
          zIndex: -1,
          width: "min(40vw, 360px)",
          height: "min(40vw, 360px)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(10,91,191,0.45) 0%, rgba(10,91,191,0) 70%)",
          filter: "blur(8px)",
          pointerEvents: "none",
        }}
      />

      <Reveal
        stagger={0.08}
        style={{
          position: "relative",
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

        {/* Cross-fade swap: form ↔ success card. Heights are similar so the band
            doesn't jump; min-height keeps the swap visually anchored. */}
        <div
          style={{
            position: "relative",
            marginTop: "var(--space-3)",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            minHeight: "56px",
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {submitted ? (
              <motion.p
                key="success"
                role="status"
                initial={prefersReduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReduced ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  background: "rgba(255, 255, 255, 0.16)",
                  border: "1px solid rgba(255, 255, 255, 0.28)",
                  borderRadius: "var(--radius-pill)",
                  padding: "var(--space-3) var(--space-5)",
                  fontSize: "var(--text-body-size)",
                  color: "var(--color-text-on-dark)",
                  margin: 0,
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.16)",
                }}
              >
                <motion.span
                  aria-hidden
                  initial={prefersReduced ? false : { scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: prefersReduced ? 0 : 0.12,
                    duration: 0.4,
                    ease: EASE_SPRING,
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "22px",
                    height: "22px",
                    flexShrink: 0,
                    borderRadius: "50%",
                    background: "var(--color-text-on-dark)",
                    color: "var(--color-accent)",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <motion.path
                      d="M5 13l4 4L19 7"
                      initial={
                        prefersReduced ? false : { pathLength: 0, opacity: 0 }
                      }
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{
                        delay: prefersReduced ? 0 : 0.22,
                        duration: 0.32,
                        ease: EASE_OUT,
                      }}
                    />
                  </svg>
                </motion.span>
                {success}
              </motion.p>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={prefersReduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReduced ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
                style={{
                  width: "100%",
                  maxWidth: "440px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "var(--space-3)",
                  justifyContent: "center",
                }}
              >
                <motion.input
                  type="email"
                  required
                  name="email"
                  placeholder={placeholder}
                  aria-label={placeholder}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  animate={
                    prefersReduced
                      ? undefined
                      : {
                          scale: focused ? 1.02 : 1,
                          boxShadow: focused
                            ? "0 0 0 4px rgba(255,255,255,0.32), 0 8px 22px rgba(0,0,0,0.18)"
                            : "0 0 0 0px rgba(255,255,255,0), 0 1px 2px rgba(0,0,0,0.06)",
                        }
                  }
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
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
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </Reveal>
    </section>
  );
}
