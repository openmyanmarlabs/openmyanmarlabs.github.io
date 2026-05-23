/**
 * Card — presentational surface container.
 *
 * White surface, hairline border, rounded corners, optional shadow.
 *
 * Pure/presentational: content via children.
 *
 * Props:
 *   elevation  false | "sm" | "md" | "float"   (default false — no shadow)
 *   radius     "sm" | "md" | "lg" | "xl"        (default "lg")
 *   padding    CSS length / token expr          (default "var(--space-6)")
 *   as         element/component to render        (default "div")
 *   ...rest    forwarded (style, onClick, aria-*, ...)
 */

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
  as: Tag = "div",
  style,
  children,
  ...rest
}: CardProps) {
  return (
    <Tag
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-hairline)",
        borderRadius: `var(--radius-${radius})`,
        boxShadow: elevation ? ELEVATION_VAR[elevation] : "none",
        padding,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
