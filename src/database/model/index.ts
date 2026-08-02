import { DateTime } from 'luxon';

export * from './brand';
export * from './company';

export * from './course';
export * from './details';
export * from './education';
export * from './experience';
export * from './inclusion';
export * from './prisma-client';
export * from './project';
export * from './repository';
export * from './school';
export * from './skills';

export type ModelTimePeriod = {
  readonly endDate: Date | null;
  readonly isCurrent?: boolean;
  readonly postPoned?: boolean;
  readonly startDate: Date;
};

const formatEndDate = (
  end: Date | null,
  { isCurrent, postPoned }: Pick<ModelTimePeriod, 'isCurrent' | 'postPoned'>,
): null | string => {
  if (end) {
    return `${DateTime.fromJSDate(end).monthLong} ${DateTime.fromJSDate(end).year}`;
  } else if (postPoned) {
    if (isCurrent) {
      throw new Error("A model's time period cannot be both postponed and current.");
    }
    return 'Postponed';
  } else if (isCurrent) {
    return 'Current';
  }
  return null;
};

export const stringifyTimePeriod = ({
  endDate,
  isCurrent,
  postPoned,
  startDate,
}: ModelTimePeriod): string =>
  `${`${DateTime.fromJSDate(startDate).monthShort} ${
    DateTime.fromJSDate(startDate).year
  }`} - ${formatEndDate(endDate, { isCurrent, postPoned })}`;

export type ModelLocation = {
  readonly city: string;
  readonly isRemote?: boolean;
  readonly state: string;
};

export const stringifyLocation = ({ city, isRemote, state }: ModelLocation): string =>
  isRemote ? 'Remote' : `${city}, ${state}`;
