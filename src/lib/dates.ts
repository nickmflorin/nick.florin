import { type DateTime } from 'luxon';

export function minDate<T extends Date | DateTime>(arg0: T, ...rest: (T | undefined)[]): T;
export function minDate<T extends Date | DateTime>(arg0: null | T | undefined, ...rest: T[]): T;
export function minDate<T extends Date | DateTime>(arg0: T, ...rest: T[]): T;
export function minDate<T extends Date | DateTime>(
  arg0: null | T | undefined,
  ...rest: (null | T | undefined)[]
): null | T;
export function minDate<T extends Date | DateTime>(
  arg0: null | T | undefined,
  ...rest: (null | T | undefined)[]
) {
  if (arg0 === null || arg0 === undefined) {
    const filteredRest = rest.filter((v): v is T => v !== null && v !== undefined);
    if (filteredRest.length === 0) {
      return null;
    } else if (filteredRest.length === 1) {
      return filteredRest[0];
    }
    return filteredRest
      .slice(1)
      .reduce((prev, curr) => (curr < prev ? curr : prev), filteredRest[0]);
  }
  const filteredRest = rest.filter((v): v is T => v !== null && v !== undefined);
  return filteredRest.reduce((prev, curr) => (curr < prev ? curr : prev), arg0);
}

export function maxDate<T extends Date | DateTime>(arg0: T, ...rest: (T | undefined)[]): T;
export function maxDate<T extends Date | DateTime>(arg0: null | T | undefined, ...rest: T[]): T;
export function maxDate<T extends Date | DateTime>(arg0: T, ...rest: T[]): T;
export function maxDate<T extends Date | DateTime>(
  arg0: null | T | undefined,
  ...rest: (null | T | undefined)[]
): null | T;
export function maxDate<T extends Date | DateTime>(
  arg0: null | T | undefined,
  ...rest: (null | T | undefined)[]
) {
  if (arg0 === null || arg0 === undefined) {
    const filteredRest = rest.filter((v): v is T => v !== null && v !== undefined);
    if (filteredRest.length === 0) {
      return null;
    } else if (filteredRest.length === 1) {
      return filteredRest[0];
    }
    return filteredRest
      .slice(1)
      .reduce((prev, curr) => (curr > prev ? curr : prev), filteredRest[0]);
  }
  const filteredRest = rest.filter((v): v is T => v !== null && v !== undefined);
  return filteredRest.reduce((prev, curr) => (curr > prev ? curr : prev), arg0);
}
