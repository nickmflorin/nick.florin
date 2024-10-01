export * from "./generated";
export * from "./company";
export * from "./course";
export * from "./details";
export * from "./education";
export * from "./experience";
export * from "./project";
export * from "./inclusion";
export * from "./repository";
export * from "./school";
export * from "./skills";
export * from "./brand";

import { DateTime } from "luxon";

export { Prisma } from "./generated";

export type ModelTimePeriod = {
  readonly startDate: Date;
  readonly endDate: Date | null;
  readonly postPoned?: boolean;
  readonly isCurrent?: boolean;
};

const formatEndDate = (
  end: Date | null,
  { postPoned, isCurrent }: Pick<ModelTimePeriod, "isCurrent" | "postPoned">,
): string | null => {
  if (end) {
    return `${DateTime.fromJSDate(end).monthLong} ${DateTime.fromJSDate(end).year}`;
  } else if (postPoned) {
    if (isCurrent) {
      throw new Error("A model's time period cannot be both postponed and current.");
    }
    return "Postponed";
  } else if (isCurrent) {
    return "Current";
  }
  return null;
};

export const stringifyTimePeriod = ({
  startDate,
  endDate,
  postPoned,
  isCurrent,
}: ModelTimePeriod): string =>
  `${`${DateTime.fromJSDate(startDate).monthShort} ${
    DateTime.fromJSDate(startDate).year
  }`} - ${formatEndDate(endDate, { postPoned, isCurrent })}`;

export type ModelLocation = {
  readonly city: string;
  readonly state: string;
  readonly isRemote?: boolean;
};

export const stringifyLocation = ({ city, state, isRemote }: ModelLocation): string =>
  isRemote ? "Remote" : `${city}, ${state}`;
