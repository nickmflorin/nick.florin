import { DateTime } from "luxon";

export interface TimeDisplayProps {
  readonly date: Date | string;
  readonly prefix?: string;
  readonly format?: Intl.DateTimeFormatOptions;
}

export const TimeDisplay = ({
  date,
  prefix,
  format = DateTime.DATETIME_MED,
}: TimeDisplayProps): string =>
  prefix
    ? `${prefix} ${
        typeof date !== "string" ? DateTime.fromJSDate(date).toLocaleString(format) : date
      }`
    : typeof date !== "string"
      ? DateTime.fromJSDate(date).toLocaleString(format)
      : date;
