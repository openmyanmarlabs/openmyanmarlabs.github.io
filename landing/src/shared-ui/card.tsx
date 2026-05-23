/**
 * Card — presentational surface container.
 *
 * White surface, hairline border, rounded corners, optional shadow.
 *
 * Opt-in hover: set `interactive` to give the card a tactile hover-lift
 * (~4px rise + raised shadow). OFF by default, so every existing static card is
 * visually unchanged. Reduced-motion-safe — under prefers-reduced-motion the
 * card renders plain (no motion wrapper, no lift).
 *
 * Pure/presentational: content via children.
 *
 * Props:
 *   elevation    false | "sm" | "md" | "float"   (default false — no shadow)
 *   radius       "sm" | "md" | "lg" | "xl"        (default "lg")
 *   padding      CSS length / token expr          (default "var(--space-6)")
 *   interactive  boolean — opt-in hover-lift       (default false)
 *   as           element/component to render        (default "div")
 *   ...rest      forwarded (style, onClick, aria-*, ...)
 */

import { motion, useReducedMotion } from "motion/react";
import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
} from "react";

export type CardElevation = false | "sm" | "md" | "float";
export type CardRadius = "sm" | "md" | "lg" | "xl";

export interface CardProps extends ComponentPropsWithoutRef<"div"> {
  elevation?: CardElevation;
  radius?: CardRadius;
  padding?: CSSProperties["padding"];
  /** Opt-in hover-lift (rise + raised shadow). Default false — static card. */
  interactive?: boolean;
  as?: ElementType;
}

const ELEVATION_VAR: Record<Exclude<CardElevation, false>, string> = {
  sm: "var(--elevation-sm)",
  md: "var(--elevation-md)",
  float: "var(--elevation-float)",
};

export function Card({
  elevation = false,
  radius = "lg",
  padding = "var(--space-6)",
  interactive = false,
  as: Tag = "div",
  style,
  children,
  ...rest
}: CardProps) {
  const prefersReduced = useReducedMotion();

  const baseStyle: CSSProperties = {
    background: "var(--color-surface)",
    border: "1px solid var(--color-hairline)",
    borderRadius: `var(--radius-${radius})`,
    boxShadow: elevation ? ELEVATION_VAR[elevation] : "none",
    padding,
    ...style,
  };

  // Interactive + motion allowed: lift on hover (mirrors --hover-lift-card /
  // --elevation-hover). Otherwise render plain — existing static cards untouched.
  if (interactive && !prefersReduced) {
    const MotionTag = motion.create(Tag);
    return (
      <MotionTag
        whileHover={{ y: -4, boxShadow: "var(--elevation-hover)" }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        style={baseStyle}
        {...rest}
      >
        {children}
      </MotionTag>
    );
  }

  return (
    <Tag style={baseStyle} {...rest}>
      {children}
    </Tag>
  );
}
