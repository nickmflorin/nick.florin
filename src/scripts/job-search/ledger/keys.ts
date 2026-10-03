const padDatePart = (value: number): string => String(value).padStart(2, '0');

/**
 * Formats a date as its calendar date in the machine's local time zone, of the form `2026-10-03`.
 *
 * The ledger keys daily activity and runs by this date rather than by the UTC date that
 * `toISOString` reports, under which a run in the evening would count against the next day.
 *
 * @param {Date} date The date to format.
 *
 * @returns {string} The local calendar date.
 */
export const localDateKey = (date: Date): string =>
  `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;

/**
 * Derives the identifier of a new run: the local date it starts on, followed by the next ordinal
 * after the runs already recorded for that date.
 *
 * @param {readonly string[]} existing The identifiers of the runs already recorded.
 * @param {Date} startedAt The time the new run starts.
 *
 * @returns {string} The new run's identifier, of the form `2026-10-03-1`.
 */
export const nextRunId = (existing: readonly string[], startedAt: Date): string => {
  const prefix = `${localDateKey(startedAt)}-`;
  const ordinals = existing
    .filter(id => id.startsWith(prefix))
    .map(id => Number(id.slice(prefix.length)));
  return `${prefix}${Math.max(0, ...ordinals) + 1}`;
};
