import { z } from 'zod';

import { type Candidate, LinkedInJobIdPattern, type Workplace } from '../schemas';

/**
 * One result card as the `result-cards` page script reads it: the title from the card's "Dismiss"
 * button, the card's text lines, and the job identifier when the card links to the posting.
 */
const ResultCardSchema = z.object({
  id: z.string().regex(LinkedInJobIdPattern).nullable(),
  lines: z.array(z.string()),
  title: z.string(),
});

export type ResultCard = z.infer<typeof ResultCardSchema>;

/**
 * The whole output of the `result-cards` page script: the cards, the filters the page reports as
 * applied, the location it shows, and the page address, which reveals a redirect to a sign-in or
 * security-challenge page.
 */
export const ResultCardsReadingSchema = z.object({
  cards: z.array(ResultCardSchema),
  filters: z.array(z.string()),
  location: z.string().nullable(),
  url: z.string(),
});

export type ResultCardsReading = z.infer<typeof ResultCardsReadingSchema>;

/**
 * What a result card publishes of a posting: every candidate field except where it was found.
 */
export type CardFacts = Omit<Candidate, 'source'>;

type Compensation = NonNullable<Candidate['compensation']>;

const UnitMilliseconds: Record<string, number | undefined> = {
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
};

const WorkplaceLabels: Record<string, undefined | Workplace> = {
  hybrid: 'hybrid',
  'on-site': 'onsite',
  onsite: 'onsite',
  remote: 'remote',
};

const WorkplaceLinePattern = /^(.*?)\s*\((remote|hybrid|on-?site)\)\s*$/i;

const PostedPattern = /(\d+)\s+(minute|hour|day|week|month)s?\s+ago/i;

const YearlyPayPattern = /\/\s?yr\b|per year|a year|annual/i;

const AmountPattern = /\$\s?(\d[\d,]*(?:\.\d+)?)\s?([KkMm])?/g;

const AmountMultipliers: Record<string, number | undefined> = { k: 1000, m: 1000000 };

const SizeRangePattern = /(\d[\d,]*)\s*[-–]\s*(\d[\d,]*)\s+employees/i;

const SizeOpenEndedPattern = /(\d[\d,]*)\+\s+employees/i;

const SponsorshipRefusals =
  "(?:unable to|not able to|cannot|can't|will not|won't|do not|does not|don't)";

const NoSponsorshipPatterns = [
  /\bno\s+(?:visa\s+)?sponsorship\b/i,
  new RegExp(`\\b${SponsorshipRefusals}\\s+(?:offer\\s+|provide\\s+)?(?:visa\\s+)?sponsor`, 'i'),
  /\bsponsorship\s+(?:is\s+)?(?:not\s+(?:available|offered|provided)|unavailable)/i,
] as const;

const FactLinePattern =
  /employees|\$\s?\d|USD|salary|compensation|sponsor|visa|hybrid|on-?site|in-office|office|relocat/i;

const FactLimit = 20;

const FactWidth = 220;

const nonBlank = (text: string | undefined): null | string =>
  text === undefined || text.trim() === '' ? null : text.trim();

const firstMatch = (pattern: RegExp, lines: readonly string[]): RegExpExecArray | undefined =>
  lines
    .flatMap(line => {
      const match = pattern.exec(line);
      return match === null ? [] : [match];
    })
    .at(0);

const digitsOf = (text: string | undefined): string => (text ?? '').replace(/,/g, '');

const collapse = (text: string): string => text.replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * Whether a card line is the posting's title again. LinkedIn's card text repeats the title — as the
 * link text and again as the accessible name — and appends "with verification" to one repeat.
 */
const isTitleRepeat = (line: string, title: string): boolean => {
  const normalizedLine = collapse(line);
  const normalizedTitle = collapse(title);
  return (
    normalizedLine === normalizedTitle ||
    (normalizedLine.startsWith(`${normalizedTitle} `) &&
      /^(?:\(.*\)|with verification|verified)$/.test(
        normalizedLine.slice(normalizedTitle.length).trim(),
      ))
  );
};

const amountOf = (digits: string, suffix: string | undefined): number =>
  Math.round(
    Number.parseFloat(digitsOf(digits)) * (AmountMultipliers[suffix?.toLowerCase() ?? ''] ?? 1),
  );

/**
 * Reads a stated yearly pay range, such as `$150K/yr - $180K/yr`, from a line of text.
 *
 * Only a yearly figure is read: an hourly rate cannot be compared with the yearly floor, so it is
 * left unlisted. A single figure is the range's lower bound.
 *
 * @param {string} line A line of a result card or a posting.
 *
 * @returns {Compensation | null} The range, or `null` when the line states no yearly pay.
 */
export const parseCompensation = (line: string): Compensation | null => {
  const amounts = YearlyPayPattern.test(line)
    ? [...line.matchAll(AmountPattern)].map(match => amountOf(match.at(1) ?? '', match.at(2)))
    : [];
  const first = amounts.at(0);
  const second = amounts.at(1);
  if (first === undefined || first <= 0) {
    return null;
  }
  return second === undefined || second <= 0
    ? { currency: 'USD', maximum: null, minimum: first }
    : { currency: 'USD', maximum: Math.max(first, second), minimum: Math.min(first, second) };
};

/**
 * Finds the company in a card's text lines: the first line after the last of the consecutive lines
 * that repeat the title, since the card text repeats the title before it names the company.
 *
 * @param {readonly string[]} lines The card's text lines.
 * @param {string} title The posting's title.
 *
 * @returns {number | null} The index of the company's line, or `null` when the card names none.
 */
const companyIndexOf = (lines: readonly string[], title: string): null | number => {
  const start = Math.max(
    0,
    lines.findIndex(line => isTitleRepeat(line, title)),
  );
  const offset = lines.slice(start).findIndex(line => !isTitleRepeat(line, title));
  return offset === -1 ? null : start + offset;
};

/**
 * Reads when a card says its posting was posted, as a point in time computed back from now.
 */
const postedAtOf = (lines: readonly string[], now: Date): null | string => {
  const match = firstMatch(PostedPattern, lines);
  const unit = UnitMilliseconds[match?.at(2)?.toLowerCase() ?? ''];
  return match === undefined || unit === undefined
    ? null
    : new Date(now.getTime() - Number.parseInt(match.at(1) ?? '0', 10) * unit).toISOString();
};

/**
 * Converts one result card into the facts it publishes of its posting.
 *
 * The company is the first line after the title's repeats, the location and workplace come from the
 * `City, ST (Remote|Hybrid|On-site)` line, the pay from a yearly range, and the posting's age from
 * `Posted N units ago`. Every fact the card does not show is `null`, and the application is
 * `easy-apply` only when a line reads `Easy Apply`.
 *
 * @param {ResultCard} card The card, as the page script read it.
 * @param {Date} now When the page was read, which the posting's age is counted back from.
 *
 * @returns {CardFacts | null} The facts, or `null` when the card's text names no company.
 */
export const parseCard = ({ id, lines, title }: ResultCard, now: Date): CardFacts | null => {
  const companyIndex = companyIndexOf(lines, title);
  const company = companyIndex === null ? undefined : lines.at(companyIndex)?.trim();
  if (companyIndex === null || company === undefined || company === '') {
    return null;
  }
  const following = lines.slice(companyIndex + 1);
  const workplaceLine = firstMatch(WorkplaceLinePattern, following);
  return {
    applyUrl: null,
    applyVia: following.some(line => /^easy apply$/i.test(line.trim()))
      ? 'easy-apply'
      : 'unresolved',
    company,
    companySize: null,
    compensation: following.map(parseCompensation).find(range => range !== null) ?? null,
    id,
    location: nonBlank(workplaceLine?.at(1)),
    postedAt: postedAtOf(following, now),
    sponsorshipOffered: null,
    title,
    workplace: WorkplaceLabels[workplaceLine?.at(2)?.toLowerCase() ?? ''] ?? null,
  };
};

export interface ParsedCards {
  readonly facts: CardFacts[];
  /**
   * The titles of the cards whose text named no company, which cannot be triaged.
   */
  readonly unreadable: string[];
}

/**
 * Converts every card of a page into the facts it publishes, setting aside the cards that cannot
 * be read.
 *
 * @param {readonly ResultCard[]} cards The cards, as the page script read them.
 * @param {Date} now When the page was read.
 *
 * @returns {ParsedCards} The facts of the readable cards, and the titles of the others.
 */
export const parseCards = (cards: readonly ResultCard[], now: Date): ParsedCards => {
  const parsed = cards.map(card => ({ card, facts: parseCard(card, now) }));
  return {
    facts: parsed.flatMap(({ facts }) => (facts === null ? [] : [facts])),
    unreadable: parsed.filter(({ facts }) => facts === null).map(({ card }) => card.title),
  };
};

/**
 * Reads the company-size band a posting states, such as `51-200 employees` or `10,001+ employees`.
 *
 * @param {readonly string[]} lines The posting's text lines.
 *
 * @returns {string | null} The band as the preferences spell it, or `null` when none is stated.
 */
export const companySizeBandOf = (lines: readonly string[]): null | string => {
  const range = firstMatch(SizeRangePattern, lines);
  const openEnded = firstMatch(SizeOpenEndedPattern, lines);
  if (range !== undefined) {
    return `${digitsOf(range.at(1))}-${digitsOf(range.at(2))}`;
  }
  return openEnded === undefined ? null : `${digitsOf(openEnded.at(1))}+`;
};

/**
 * Whether any line of a posting says it offers no visa sponsorship.
 *
 * @param {readonly string[]} lines The posting's text lines.
 *
 * @returns {boolean} `true` only when the text says no sponsorship is offered.
 */
export const declinesSponsorship = (lines: readonly string[]): boolean =>
  lines.some(line => NoSponsorshipPatterns.some(pattern => pattern.test(line)));

/**
 * Splits a posting's text into its trimmed, non-empty lines.
 *
 * @param {string} text The posting's text.
 *
 * @returns {string[]} The lines, in order.
 */
export const linesOf = (text: string): string[] =>
  text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '');

/**
 * Picks out the lines of a posting's text that state facts the detail-stage triage needs — pay,
 * company size, sponsorship and the office arrangement — for the agent to read in context.
 *
 * @param {string} text The posting's text.
 *
 * @returns {string[]} At most twenty trimmed, width-limited lines.
 */
export const factLinesOf = (text: string): string[] =>
  linesOf(text)
    .filter(line => FactLinePattern.test(line))
    .slice(0, FactLimit)
    .map(line => line.slice(0, FactWidth));
