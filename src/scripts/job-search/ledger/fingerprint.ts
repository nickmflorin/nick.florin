import { type Posting } from '../schemas';

/**
 * The legal-entity suffixes dropped from the end of a company name before comparison.
 */
const LegalSuffixes = new Set([
  'co',
  'company',
  'corp',
  'corporation',
  'gmbh',
  'inc',
  'incorporated',
  'limited',
  'llc',
  'ltd',
  'plc',
]);

const DiacriticalMarks = /[\u0300-\u036f]/gu;

const WordSeparators = /[^a-z0-9]+/u;

/**
 * Splits text into the lowercase, diacritic-free words that every comparison in the job-search
 * tooling is made over, so that punctuation and casing never decide a match.
 *
 * @param {string} value The text to split.
 *
 * @returns {string[]} The words, in order.
 */
export const toWords = (value: string): string[] =>
  value
    .normalize('NFKD')
    .replace(DiacriticalMarks, '')
    .toLowerCase()
    .split(WordSeparators)
    .filter(word => word !== '');

const withoutLegalSuffixes = (words: readonly string[]): readonly string[] =>
  words.length > 1 && LegalSuffixes.has(words.at(-1) ?? '')
    ? withoutLegalSuffixes(words.slice(0, -1))
    : words;

export const companyNameWords = (name: string): readonly string[] =>
  withoutLegalSuffixes(toWords(name));

/**
 * Normalizes a company name for comparison: lowercased, stripped of diacritics and punctuation, and
 * without trailing legal suffixes, so that `Acme, Inc.` and `ACME` compare equal.
 *
 * @param {string} name The company name as LinkedIn displays it.
 *
 * @returns {string} The normalized name, its words joined by hyphens.
 */
export const normalizeCompanyName = (name: string): string => companyNameWords(name).join('-');

export const normalizeTitle = (title: string): string => toWords(title).join('-');

/**
 * Derives a posting's fingerprint — its normalized company name and title — which identifies the
 * same role when LinkedIn reposts it under a new job identifier.
 *
 * @param {Pick<Posting, 'company' | 'title'>} posting The posting's company and title.
 *
 * @returns {string} The fingerprint, of the form `acme|senior-frontend-engineer`.
 */
export const postingFingerprint = ({
  company,
  title,
}: Pick<Posting, 'company' | 'title'>): string =>
  `${normalizeCompanyName(company)}|${normalizeTitle(title)}`;

/**
 * Finds the recorded posting that a newly seen one duplicates: the posting with the same LinkedIn
 * job identifier or, failing that, the same fingerprint.
 *
 * @param {readonly Posting[]} postings The recorded postings.
 * @param {Pick<Posting, 'fingerprint' | 'id'>} candidate The newly seen posting.
 *
 * @returns {null | Posting} The duplicated posting, or `null` when the candidate is new.
 */
export const findDuplicate = (
  postings: readonly Posting[],
  candidate: Pick<Posting, 'fingerprint' | 'id'>,
): null | Posting =>
  postings.find(posting => posting.id === candidate.id) ??
  postings.find(posting => posting.fingerprint === candidate.fingerprint) ??
  null;
