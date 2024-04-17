import { DateTime } from "luxon";

export interface DateTimeDisplayProps {
  readonly date: Date | string;
  readonly prefix?: string;
  readonly format?: Intl.DateTimeFormatOptions;
}

export const DateTimeDisplay = ({
  date,
  prefix,
  format = DateTime.DATETIME_MED,
}: DateTimeDisplayProps): string =>
  prefix
    ? `${prefix} ${
        typeof date !== "string" ? DateTime.fromJSDate(date).toLocaleString(format) : date
      }`
    : typeof date !== "string"
      ? DateTime.fromJSDate(date).toLocaleString(format)
      : date;
