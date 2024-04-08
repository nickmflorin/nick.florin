import { type ModelTimePeriod, stringifyTimePeriod } from "~/prisma/model";

import { Tag, type TagProps } from "./Tag";

export interface TimePeriodTagProps extends Omit<TagProps, "children" | "icon"> {
  readonly timePeriod: ModelTimePeriod;
}

export const TimePeriodTag = ({ timePeriod, ...props }: TimePeriodTagProps): JSX.Element => (
  <Tag {...props} icon={{ name: "calendar" }}>
    {stringifyTimePeriod(timePeriod)}
  </Tag>
);
