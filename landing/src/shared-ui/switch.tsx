/**
 * Switch — generic, controlled iOS-style sliding toggle.
 *
 * A pill track with a sliding thumb. Two labels (left / right) sit inside the
 * track; the active side is emphasised and the thumb springs across to it. Fully
 * controlled — `checked` + `onChange` — and NOT domain-specific (the Nav phase
 * wires it to language; anything else can reuse it).
 *
 *   checked === false -> thumb LEFT,  `labelLeft`  active
 *   checked === true  -> thumb RIGHT, `labelRight` active
 *
 * Accessibility:
 *   - role="switch" + aria-checked reflect state.
 *   - Operable by mouse and keyboard (Space / Enter toggle).
 *   - Visible :focus-visible ring (accent), no ring on mouse focus.
 *   - Both labels render as real text so the wider Burmese endonym ("မြန်မာ")
 *     is measured by the layout — the track always fits the longer side.
 *
 * Reduced-motion: the thumb SNAPS instead of springing (no overshoot), matching
 * the established token + useReducedMotion pattern. Colour transitions still run
 * but collapse to ~0 via --duration-micro under prefers-reduced-motion.
 *
 * Pure/presentational: labels via props, state via props. No copy baked in.
 *
 * Props:
 *   checked     boolean — true = right side active            (required)
 *   onChange    (next: boolean) => void                       (required)
 *   labelLeft   node shown on the left  (active when !checked) (required)
 *   labelRight  node shown on the right (active when checked)  (required)
 *   ariaLabel   accessible name for the control               (recommended)
 *   disabled    boolean                                       (default false)
 *   ...rest     forwarded to the track <button> (id, data-*, ...)
 */

import { motion, useReducedMotion } from "motion/react";
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";

export interface SwitchProps extends Omit<
  ComponentPropsWithoutRef<"button">,
  "onChange"
> {
  checked: boolean;
  onChange: (next: boolean) => void;
  labelLeft: ReactNode;
  labelRight: ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
}

const PAD = 3; // px — inset of the thumb from the track edge

export function Switch({
  checked,
  onChange,
  labelLeft,
  labelRight,
  ariaLabel,
  disabled = false,
  style,
  ...rest
}: SwitchProps) {
  const prefersReduced = useReducedMotion();

  const toggle = () => {
    if (disabled) return;
    onChange(!checked);
  };

  const labelBase: CSSProperties = {
    position: "relative",
    zIndex: 1,
    flex: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
    padding: "0 var(--space-3)",
    fontSize: "var(--text-small-size)",
    fontWeight: 500,
    lineHeight: 1,
    whiteSpace: "nowrap",
    transition: "color var(--duration-micro) var(--ease-standard)",
    userSelect: "none",
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={toggle}
      style={{
        // Track — padding holds the PAD gutter; the inner wrapper is the
        // positioning context so the thumb's 50% / x:100% resolve exactly.
        display: "inline-flex",
        height: 34,
        padding: PAD,
        border: "1px solid var(--color-hairline)",
        borderRadius: "var(--radius-pill)",
        background: "var(--color-panel)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      {...rest}
    >
      {/* Inner content area: positioning context + flex row of the two labels.
          Equal flex labels make each half exactly 50%, so the thumb (50% wide)
          and its x:100% travel are pixel-correct for any label widths — the
          wider Burmese endonym just stretches the whole control symmetrically. */}
      <span
        style={{
          position: "relative",
          display: "flex",
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Sliding thumb — sits behind the labels, springs across on toggle. */}
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={{ x: checked ? "100%" : "0%" }}
          transition={
            prefersReduced
              ? { duration: 0 }
              : {
                  type: "spring",
                  stiffness: 520,
                  damping: 32,
                }
          }
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: "50%",
            borderRadius: "var(--radius-pill)",
            background: "var(--color-surface)",
            boxShadow: "var(--elevation-sm)",
          }}
        />

        <span
          style={{
            ...labelBase,
            color: checked ? "var(--color-text-muted)" : "var(--color-text)",
          }}
        >
          {labelLeft}
        </span>
        <span
          style={{
            ...labelBase,
            color: checked ? "var(--color-text)" : "var(--color-text-muted)",
          }}
        >
          {labelRight}
        </span>
      </span>
    </button>
  );
}
