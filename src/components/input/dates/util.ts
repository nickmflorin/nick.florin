import { DateTime } from "luxon";

import { logger } from "~/internal/logger";

export const toDateTime = (v: Date | DateTime | string | null): DateTime | null => {
  if (v instanceof Date) {
    return DateTime.fromJSDate(v);
  } else if (v instanceof DateTime) {
    return v;
  } else if (typeof v === "string") {
    const dt = DateTime.fromISO(v);
    if (!dt.isValid) {
      logger.error(`The date string '${v}' is not valid!`);
      return null;
    }
    return dt;
  }
  return null;
};
