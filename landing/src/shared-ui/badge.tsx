/**
 * Badge — presentational status pill.
 *
 * Variants: free (green) / soon (gray) / pro (blue) / neutral.
 * App-status mapping (applied by callers, not here):
 *   Live        -> free  (green)
 *   Coming soon -> soon  (gray)
 *
 * Pure/presentational: label via children. No copy baked in.
 *
 * Props:
 *   variant   "free" | "soon" | "pro" | "neutral"   (default "neutral")
 *   ...rest   forwarded (style, aria-*, ...)
 */

import type { ComponentPropsWithoutRef, CSSProperties } from "react";

export type BadgeVariant = "free" | "soon" | "pro" | "neutral";

export interface BadgeProps extends ComponentPropsWithoutRef<"span"> {
  variant?: BadgeVariant;
}

const VARIANT_STYLE: Record<BadgeVariant, CSSProperties> = {
  free: {
    background: "var(--color-success-tint)",
    color: "var(--color-success)",
  },
  soon: {
    background: "var(--color-panel)",
    color: "var(--color-text-muted)",
  },
  pro: {
    background: "var(--color-accent-tint)",
    color: "var(--color-accent)",
  },
  neutral: {
    background: "var(--color-panel)",
    color: "var(--color-text)",
  },
};

export function Badge({
  variant = "neutral",
  style,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-1)",
        padding: "var(--space-1) var(--space-3)",
        borderRadius: "var(--radius-pill)",
        fontSize: "var(--text-caption-size)",
        fontWeight: 500,
        lineHeight: 1.4,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
        ...VARIANT_STYLE[variant],
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
