import { type ModelTimePeriod, stringifyTimePeriod } from "~/database/model";

import { Badge, type BadgeProps } from "./Badge";

export interface TimePeriodBadgeProps
  extends Omit<BadgeProps, "children" | "icon" | "iconClassName"> {
  readonly timePeriod: ModelTimePeriod;
}

export const TimePeriodBadge = ({ timePeriod, ...props }: TimePeriodBadgeProps): JSX.Element => (
  <Badge icon={{ name: "calendar" }} {...props}>
    {stringifyTimePeriod(timePeriod)}
  </Badge>
);
