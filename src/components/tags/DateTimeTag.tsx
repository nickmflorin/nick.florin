import { DateTime } from "luxon";

import { Tag, type TagProps } from "./Tag";

export interface DateTimeTagProps extends Omit<TagProps, "children" | "icon"> {
  readonly date: Date;
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
    {prefix
      ? `${prefix} ${DateTime.fromJSDate(date).toLocaleString(format)}`
      : DateTime.fromJSDate(date).toLocaleString(format)}
  </Tag>
);
