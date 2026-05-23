/**
 * CountUp — animates a number from `from` up to `to` when scrolled into view.
 *
 * Uses motion's `animate` driving a motion value. Under reduced-motion it SNAPS
 * straight to the final value (no animation). Renders an inline <span> with
 * tabular numerals so the width is stable while counting.
 *
 * Pure/presentational: the number + formatting come from props.
 *
 * Props:
 *   to         number — target value (required)
 *   from       number — starting value          (default 0)
 *   duration   seconds                           (default 1.6)
 *   decimals   fixed decimal places              (default 0)
 *   prefix     node rendered before the number   (e.g. "$")
 *   suffix     node rendered after the number    (e.g. "+", "%")
 *   format     (n:number) => string — custom formatter (overrides decimals)
 *   ...rest    forwarded to the wrapping <span> (style, aria-*, ...)
 */

import { useEffect, useRef, useState } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

// `prefix` is also a native HTML attribute (string); omit it so we can widen
// prefix/suffix to ReactNode per the component's contract.
export interface CountUpProps extends Omit<
  ComponentPropsWithoutRef<"span">,
  "prefix"
> {
  to: number;
  from?: number;
  duration?: number;
  decimals?: number;
  prefix?: ReactNode;
  suffix?: ReactNode;
  format?: (n: number) => string;
}

export function CountUp({
  to,
  from = 0,
  duration = 1.6,
  decimals = 0,
  prefix = null,
  suffix = null,
  format,
  style,
  ...rest
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const prefersReduced = useReducedMotion();
  const [display, setDisplay] = useState(from);

  const render =
    typeof format === "function"
      ? format
      : (n: number) => Number(n).toFixed(decimals);

  useEffect(() => {
    if (!inView) return;

    // Reduced-motion: snap to final, no animation.
    if (prefersReduced) {
      setDisplay(to);
      return;
    }

    const controls = animate(from, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, prefersReduced, from, to, duration]);

  return (
    <span
      ref={ref}
      style={{
        fontVariantNumeric: "tabular-nums",
        fontFeatureSettings: '"tnum" 1',
        ...style,
      }}
      {...rest}
    >
      {prefix}
      {render(display)}
      {suffix}
    </span>
  );
}
