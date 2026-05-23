/**
 * shared-ui — barrel for the presentational primitives.
 * Import ergonomically: `import { Button, Badge, Card } from "../shared-ui";`
 */

export { Button } from "./button";
export { Badge } from "./badge";
export { Card } from "./card";
export { StatTile } from "./stat-tile";
export { CountUp } from "./count-up";
export { Reveal } from "./reveal";

// Public prop types for section consumers.
export type { ButtonProps, ButtonVariant, ButtonSize } from "./button";
export type { BadgeProps, BadgeVariant } from "./badge";
export type { CardProps, CardElevation, CardRadius } from "./card";
export type { StatTileProps, StatTileAlign } from "./stat-tile";
export type { CountUpProps } from "./count-up";
export type { RevealProps } from "./reveal";
