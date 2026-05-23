/**
 * Reveal — scroll-triggered fade + ~24px lift, animated once.
 *
 * Wraps content; when it scrolls into view it fades in and lifts up. Multiple
 * children can be staggered by passing `stagger` (each direct child animates in
 * sequence). Uses ease-reveal cubic-bezier(.22,1,.36,1).
 *
 * Reduced-motion: INERT — content is shown immediately with no opacity/transform
 * animation (no fade, no lift).
 *
 * Pure/presentational.
 *
 * Props:
 *   as        element to render            (default "div")
 *   delay     seconds before starting      (default 0)
 *   stagger   seconds between children     (default 0 — animate as one block)
 *   y         lift distance in px          (default 24)
 *   once      animate only the first time  (default true)
 *   amount    fraction in view to trigger  (default 0.2)
 *   ...rest   forwarded to the wrapper (style, className, ...)
 */

import { motion, useReducedMotion } from "motion/react";
import { Children } from "react";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

const EASE_REVEAL = [0.22, 1, 0.36, 1] as const;

export interface RevealProps extends ComponentPropsWithoutRef<"div"> {
  as?: ElementType;
  delay?: number;
  stagger?: number;
  y?: number;
  once?: boolean;
  amount?: number;
  children?: ReactNode;
}

export function Reveal({
  as = "div",
  delay = 0,
  stagger = 0,
  y = 24,
  once = true,
  amount = 0.2,
  style,
  children,
  ...rest
}: RevealProps) {
  const prefersReduced = useReducedMotion();
  const MotionTag = motion.create(as);
  const MotionItem = motion.create("div");

  // Reduced-motion: render plain, fully visible, no transforms.
  if (prefersReduced) {
    const Tag = as;
    return (
      <Tag style={style} {...rest}>
        {children}
      </Tag>
    );
  }

  const hidden = { opacity: 0, y };
  const shown = {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_REVEAL },
  };

  // Staggered: parent orchestrates, each direct child fades+lifts in sequence.
  if (stagger > 0) {
    return (
      <MotionTag
        initial="hidden"
        whileInView="shown"
        viewport={{ once, amount }}
        variants={{
          hidden: {},
          shown: {
            transition: { delayChildren: delay, staggerChildren: stagger },
          },
        }}
        style={style}
        {...rest}
      >
        {Children.map(children, (child) => (
          <MotionItem variants={{ hidden, shown }}>{child}</MotionItem>
        ))}
      </MotionTag>
    );
  }

  // Single block.
  return (
    <MotionTag
      initial={hidden}
      whileInView={shown}
      viewport={{ once, amount }}
      transition={{ duration: 0.5, ease: EASE_REVEAL, delay }}
      style={style}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
