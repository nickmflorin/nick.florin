import { type Answers } from '../schemas';

type Start = Answers['availability']['start'];

const MillisecondsPerDay = 24 * 60 * 60 * 1000;

const Span = /^(\d+) (week|month)s?$/;

/**
 * Works out the date Nick can start on from his availability setting and the day an application is
 * filled: that day for `immediately`, that day plus the span for a span, and the date itself for a
 * date.
 *
 * @param {Start} start The availability setting.
 * @param {Date} now The day the application is filled.
 *
 * @returns {Date} The start date.
 */
export const startDate = (start: Start, now: Date): Date => {
  if (start === 'immediately') {
    return now;
  }
  const span = Span.exec(start);
  if (span === null) {
    return new Date(`${start}T12:00:00`);
  }
  const count = Number(span.at(1));
  if (span.at(2) === 'week') {
    return new Date(now.getTime() + count * 7 * MillisecondsPerDay);
  }
  const date = new Date(now);
  date.setMonth(date.getMonth() + count);
  return date;
};

/**
 * Writes the start date as a form expects it: `YYYY-MM-DD` for a native date field, and the
 * `mm/dd/yyyy` American forms use everywhere else.
 */
export const formatStartDate = (date: Date, nativeDateField: boolean): string => {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return nativeDateField ? `${year}-${month}-${day}` : `${month}/${day}/${year}`;
};

/**
 * Answers a question asking when Nick can start, in words: "Immediately", "In 2 weeks", or the
 * date.
 */
export const startPhrase = (start: Start): string => {
  if (start === 'immediately') {
    return 'Immediately';
  }
  return Span.test(start)
    ? `In ${start}`
    : new Date(`${start}T12:00:00`).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
};
