const MillisecondsPerDay = 24 * 60 * 60 * 1000;

/**
 * The average length of a month in days, over the Gregorian calendar's 400-year cycle.
 */
const DaysPerMonth = 365.2425 / 12;

export interface DateRange {
  readonly end: Date;
  readonly start: Date;
}

const mergeOverlapping = (ranges: readonly DateRange[]): DateRange[] =>
  [...ranges]
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .reduce<DateRange[]>((merged, range) => {
      const last = merged.at(-1);
      return last !== undefined && range.start.getTime() <= last.end.getTime()
        ? [
            ...merged.slice(0, -1),
            { end: range.end > last.end ? range.end : last.end, start: last.start },
          ]
        : [...merged, range];
    }, []);

/**
 * Counts the months that a set of date ranges covers, counting each stretch of time once however
 * many ranges overlap it — two concurrent roles that both used a technology add no more experience
 * with it than one.
 *
 * @param {readonly DateRange[]} ranges The ranges, in any order.
 *
 * @returns {number} The months covered, rounded to the nearest whole month.
 */
export const monthsCovered = (ranges: readonly DateRange[]): number =>
  Math.round(
    mergeOverlapping(ranges).reduce(
      (days, { end, start }) =>
        days + Math.max(0, end.getTime() - start.getTime()) / MillisecondsPerDay,
      0,
    ) / DaysPerMonth,
  );

/**
 * Converts months of experience to the whole number of years that an application form asks for,
 * rounded to the nearest year.
 */
export const monthsToYears = (months: number): number => Math.round(months / 12);
