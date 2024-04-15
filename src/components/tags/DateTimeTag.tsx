import { DateTime } from "luxon";

import { TimeDisplay } from "~/components/typography/TimeDisplay";

import { Tag, type TagProps } from "./Tag";

export interface DateTimeTagProps extends Omit<TagProps, "children" | "icon"> {
  readonly date: Date | string;
  readonly prefix?: string;
  readonly format?: Intl.DateTimeFormatOptions;
}

export const DateTimeTag = ({
  date,
  prefix,
  format = DateTime.DATETIME_MED,
  ...props
}: DateTimeTagProps): JSX.Element => (
  <Tag {...props} icon={{ name: "calendar" }}>
    <TimeDisplay date={date} prefix={prefix} format={format} />
  </Tag>
);
