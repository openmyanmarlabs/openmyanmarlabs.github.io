/**
 * StatTile — small label + big tabular-numeral value.
 *
 * Numbers are first-class: value renders large with tabular figures so digits
 * align. Value may be a string, number, or a node (e.g. a <CountUp />).
 *
 * Pure/presentational: label + value via props.
 *
 * Props:
 *   label    node — small caption above/below the value
 *   value    node — the big figure (string | number | <CountUp />)
 *   align    "start" | "center"   (default "start")
 *   ...rest  forwarded (style, ...)
 */

import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type StatTileAlign = "start" | "center";

export interface StatTileProps extends ComponentPropsWithoutRef<"div"> {
  label: ReactNode;
  value: ReactNode;
  align?: StatTileAlign;
}

export function StatTile({
  label,
  value,
  align = "start",
  style,
  ...rest
}: StatTileProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-1)",
        alignItems: align === "center" ? "center" : "flex-start",
        textAlign: align === "center" ? "center" : "left",
        ...style,
      }}
      {...rest}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-stat)",
          fontWeight: "var(--text-display-weight)",
          lineHeight: "var(--leading-heading)",
          letterSpacing: "var(--tracking-display)",
          fontVariantNumeric: "tabular-nums",
          fontFeatureSettings: '"tnum" 1',
          color: "var(--color-text)",
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: "var(--text-small-size)",
          color: "var(--color-text-muted)",
        }}
      >
        {label}
      </span>
    </div>
  );
}
