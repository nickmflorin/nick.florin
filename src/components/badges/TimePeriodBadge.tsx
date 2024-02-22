import clsx from "clsx";

import { type ModelTimePeriod, stringifyTimePeriod } from "~/prisma/model";

import { Badge, type BadgeProps } from "./Badge";

export interface TimePeriodBadgeProps
  extends Omit<BadgeProps, "children" | "icon" | "iconClassName"> {
  readonly timePeriod: ModelTimePeriod;
}

export const TimePeriodBadge = ({ timePeriod, ...props }: TimePeriodBadgeProps): JSX.Element => (
  <Badge
    size="sm"
    icon={{ name: "calendar" }}
    {...props}
    className={clsx("font-medium", props.className)}
  >
    {stringifyTimePeriod(timePeriod)}
  </Badge>
);
