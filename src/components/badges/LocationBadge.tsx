import { type ModelLocation, stringifyLocation } from "~/prisma/model";

import { Badge, type BadgeProps } from "./Badge";

export interface LocationBadgeProps
  extends Omit<BadgeProps, "children" | "icon" | "iconClassName"> {
  readonly location: ModelLocation;
}

export const LocationBadge = ({ location, ...props }: LocationBadgeProps): JSX.Element => (
  <Badge icon={{ name: "location-dot" }} {...props}>
    {stringifyLocation(location)}
  </Badge>
);
