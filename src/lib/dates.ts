import { type DateTime } from "luxon";

export const minDate = <T extends Date | DateTime>(...dates: T[]): T =>
  dates.reduce((prev, curr) => (curr < prev ? curr : prev));

export const maxDate = <T extends Date | DateTime>(...dates: T[]): T =>
  dates.reduce((prev, curr) => (curr > prev ? curr : prev));
