/**
 * Button — presentational action primitive.
 *
 * Variants: primary (accent pill) / secondary (panel) / ghost.
 * Sizes:    sm / md / lg.
 * Press:    scales to .98 on tap (motion). Reduced-motion already collapses
 *           the duration at the token layer, so press is effectively inert.
 *
 * Pure/presentational: label via children, behaviour via props. No copy baked in.
 *
 * Props:
 *   variant   "primary" | "secondary" | "ghost"   (default "primary")
 *   size      "sm" | "md" | "lg"                   (default "md")
 *   as        element/component to render          (default "button")
 *   type      native button type                   (default "button" when as="button")
 *   ...rest   forwarded (onClick, href, disabled, aria-*, style, ...)
 */

import { motion } from "motion/react";
import type { CSSProperties, ElementType, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Element/component to render; polymorphic — anything `motion.create` accepts. */
  as?: ElementType;
  type?: "button" | "submit" | "reset";
  style?: CSSProperties;
  children?: ReactNode;
  // Forwarded to the rendered element: onClick, href, disabled, aria-*, etc.
  // `as` is resolved at runtime, so the concrete element's prop set can't be
  // statically known here — extra props are accepted and passed through.
  [key: string]: unknown;
}

const VARIANT_STYLE: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: "var(--color-accent)",
    color: "var(--color-text-on-dark)",
    border: "1px solid transparent",
    borderRadius: "var(--radius-pill)",
    boxShadow: "var(--elevation-sm)",
  },
  secondary: {
    background: "var(--color-panel)",
    color: "var(--color-text)",
    border: "1px solid var(--color-hairline)",
    borderRadius: "var(--radius-pill)",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-accent)",
    border: "1px solid transparent",
    borderRadius: "var(--radius-pill)",
  },
};

const SIZE_STYLE: Record<ButtonSize, CSSProperties> = {
  sm: {
    padding: "var(--space-2) var(--space-4)",
    fontSize: "var(--text-small-size)",
  },
  md: {
    padding: "var(--space-3) var(--space-5)",
    fontSize: "var(--text-body-size)",
  },
  lg: {
    padding: "var(--space-4) var(--space-6)",
    fontSize: "var(--text-h3-size)",
  },
};

export function Button({
  variant = "primary",
  size = "md",
  as = "button",
  type,
  style,
  children,
  ...rest
}: ButtonProps) {
  // `as` is runtime-dynamic, so the motion component is built per-render.
  // motion.create accepts a string tag or component; props are forwarded below.
  const MotionTag = motion.create(as);

  return (
    <MotionTag
      type={as === "button" ? (type ?? "button") : type}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-2)",
        cursor: "pointer",
        fontWeight: 500,
        lineHeight: 1,
        textDecoration: "none",
        whiteSpace: "nowrap",
        transition:
          "background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard)",
        ...VARIANT_STYLE[variant],
        ...SIZE_STYLE[size],
        ...style,
      }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
