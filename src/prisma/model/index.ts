export * from "./core";
export * from "./company";
export * from "./course";
export * from "./details";
export * from "./education";
export * from "./experience";
export * from "./project";
export * from "./inclusion";
export * from "./school";
export * from "./skills";
export * from "./brand";

import { DateTime } from "luxon";

export type ModelTimePeriod = {
  readonly startDate: Date;
  readonly endDate: Date | null;
  readonly postPoned?: boolean;
};

const formatEndDate = (end: Date | null, postPoned?: boolean): string => {
  if (postPoned) {
    return "Postponed";
  } else if (!end) {
    return "Current";
  }
  return `${DateTime.fromJSDate(end).monthLong} ${DateTime.fromJSDate(end).year}`;
};

export const stringifyTimePeriod = ({ startDate, endDate, postPoned }: ModelTimePeriod): string =>
  `${`${DateTime.fromJSDate(startDate).monthLong} ${
    DateTime.fromJSDate(startDate).year
  }`} - ${formatEndDate(endDate, postPoned)}`;

export type ModelLocation = {
  readonly city: string;
  readonly state: string;
  readonly isRemote?: boolean;
};

export const stringifyLocation = ({ city, state, isRemote }: ModelLocation): string =>
  isRemote ? "Remote" : `${city}, ${state}`;
