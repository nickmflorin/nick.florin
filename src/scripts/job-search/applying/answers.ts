import { toWords } from '../ledger/fingerprint';
import { type DigestCompetency } from '../profile/digest';
import { type Answers, type Preferences } from '../schemas';

import { formatStartDate, startDate, startPhrase } from './availability';
import { regionName } from './places';

/**
 * The kinds of field an application form asks through, as the form reader reports them.
 */
export const FormFieldTypes = [
  'checkbox',
  'date',
  'number',
  'radio',
  'select',
  'text',
  'textarea',
] as const;

export type FormFieldType = (typeof FormFieldTypes)[number];

export interface FormQuestion {
  readonly label: string;
  /**
   * The choices of a select, radio group or checkbox group; empty for a free-text field.
   */
  readonly options: string[];
  readonly type: FormFieldType;
}

/**
 * Where an answer came from. Every answer has a source in Nick's data; a question none of them
 * answers is returned unanswered, never guessed.
 */
export const AnswerSources = ['answers', 'custom', 'digest', 'preferences', 'profile'] as const;

export type AnswerSource = (typeof AnswerSources)[number];

export type ResolvedAnswer =
  | { readonly label: string; readonly source: AnswerSource; readonly value: string }
  | { readonly label: string; readonly unanswered: true };

export interface AnswerContext {
  readonly answers: Answers;
  readonly competencies: readonly DigestCompetency[];
  /**
   * The time the form is filled, from which a start date given as a span is worked out.
   */
  readonly now: Date;
  readonly preferences: Preferences;
  readonly profile: { readonly firstName: string; readonly lastName: string };
}

type Candidate = { readonly source: AnswerSource; readonly value: string } | null;

type Resolver = (label: string, context: AnswerContext, question: FormQuestion) => Candidate;

/**
 * Options that decline to answer a voluntary self-identification question.
 */
const DeclineOption =
  /decline|prefer not|don.?t wish|do not wish|choose not|not to (?:say|answer)/i;

const normalized = (text: string): string => toWords(text).join(' ');

const yesNo = (value: boolean): string => (value ? 'Yes' : 'No');

const from = (source: AnswerSource, value: string | undefined): Candidate =>
  value === undefined ? null : { source, value };

/**
 * Finds the competency a "years of experience with …" question asks about, by its label or its
 * label's words, preferring the longest match so that `React Native` is not answered as `React`.
 */
const competencyNamed = (
  subject: string,
  competencies: readonly DigestCompetency[],
): DigestCompetency | null => {
  const wanted = ` ${normalized(subject)} `;
  return (
    [...competencies]
      .filter(({ label }) => normalized(label) !== '')
      .sort((a, b) => b.label.length - a.label.length)
      .find(({ label }) => wanted.includes(` ${normalized(label)} `)) ?? null
  );
};

/**
 * Wording that inverts or qualifies a yes-or-no question — "able to work without sponsorship",
 * "not authorized" — whose answer is then the opposite of the category's, or not a plain yes or no.
 * Such a question is left for Nick rather than answered from the category: one wrong answer to a
 * work-authorization question is an automatic rejection, where an unanswered one costs a question.
 */
const InvertedWording = /\b(?:without|not|no longer|never|unable)\b|n['’]t\b/i;

/**
 * Qualifiers that read as negations but do not invert the question: "authorized to work without
 * restriction" asks the plain question.
 */
const BenignQualifier = /\bwithout (?:any )?restrictions?\b/gi;

/**
 * An authorization question asked the other way round: whether Nick needs authorization, rather
 * than whether he has it.
 */
// cspell:disable-next-line
const AuthorizationNeeded = /\b(?:require|need)s?\b.*\bauthori[sz]ation\b/i;

const isInverted = (label: string): boolean =>
  InvertedWording.test(label.replace(BenignQualifier, ''));

const YearsOfExperience = /years?\b.*\bexperience\b.*\b(?:with|in|using|of)\b(.+)$/i;

const SelfIdentification: readonly (readonly [RegExp, keyof Answers['selfIdentification']])[] = [
  [/gender|sex\b|pronoun/i, 'gender'],
  [/race|ethnic|hispanic|latin/i, 'ethnicity'],
  [/veteran|military/i, 'veteranStatus'],
  [/disability|disabilities/i, 'disability'],
];

/**
 * The question categories answered from Nick's data, in the order they are tried. Each pattern is
 * matched against the question's label; the first that matches and yields a value fitting the field
 * answers it.
 *
 * The yes-or-no categories come before the contact categories because their questions routinely
 * mention a place — "authorized to work in the country where this role is based" — that the looser
 * location and country patterns would otherwise claim.
 */
const Resolvers: readonly (readonly [RegExp, Resolver])[] = [
  [/first name/i, (_label, { profile }) => from('profile', profile.firstName)],
  [/last name|surname|family name/i, (_label, { profile }) => from('profile', profile.lastName)],
  [
    /^(?:full |legal )?name\b/i,
    (_label, { profile }) => from('profile', `${profile.firstName} ${profile.lastName}`),
  ],
  [
    /sponsor/i,
    (label, { preferences }) =>
      isInverted(label) ? null : from('preferences', yesNo(preferences.hard.sponsorshipRequired)),
  ],
  [
    // cspell:disable-next-line
    /authori[sz]ed to work|legally (?:able|eligible|permitted) to work|work authori[sz]ation|eligible to work/i,
    (label, { answers }) =>
      isInverted(label) || AuthorizationNeeded.test(label)
        ? null
        : from('answers', yesNo(answers.workAuthorization.authorizedCountries.includes('US'))),
  ],
  [/e-?mail/i, (_label, { answers }) => from('answers', answers.contact.email)],
  [/phone|mobile/i, (_label, { answers }) => from('answers', answers.contact.phone)],
  [/linkedin/i, (_label, { answers }) => from('answers', answers.links.linkedin)],
  [/github/i, (_label, { answers }) => from('answers', answers.links.github)],
  [
    /website|portfolio|personal (?:site|url)/i,
    (_label, { answers }) => from('answers', answers.links.website),
  ],
  [
    /street|address line|^(?:home |mailing |street )?address\b/i,
    (_label, { answers }) => from('answers', answers.contact.street ?? undefined),
  ],
  [
    /\bzip\b|postal code|post ?code/i,
    (_label, { answers }) => from('answers', answers.contact.postalCode ?? undefined),
  ],
  [
    /\bcity\b|location|where .*(?:live|located|based)/i,
    (_label, { answers }) => from('answers', `${answers.contact.city}, ${answers.contact.region}`),
  ],
  [
    /^(?:state|province|region)\b|state\s*\/\s*province/i,
    (_label, { answers }) => from('answers', answers.contact.region),
  ],
  [/country/i, (_label, { answers }) => from('answers', answers.contact.country)],
  [
    /date available|available (?:start )?date|start date|earliest (?:possible )?start|availability date/i,
    (_label, { answers, now }, { type }) =>
      from('answers', formatStartDate(startDate(answers.availability.start, now), type === 'date')),
  ],
  [
    /notice period|when can you start|available to start|how soon/i,
    (_label, { answers }) => from('answers', startPhrase(answers.availability.start)),
  ],
  [
    /salary|compensation|pay expectation|desired pay|expected pay/i,
    (_label, { answers }) => from('answers', String(answers.compensation.target)),
  ],
  [
    YearsOfExperience,
    (label, { competencies }) => {
      const subject = YearsOfExperience.exec(label)?.[1];
      const competency = subject === undefined ? null : competencyNamed(subject, competencies);
      return competency === null ? null : from('digest', String(competency.years));
    },
  ],
  [/how did you (?:hear|find|learn)/i, () => from('answers', 'LinkedIn')],
  ...SelfIdentification.map(([pattern, key]): readonly [RegExp, Resolver] => [
    pattern,
    (_label, { answers }) => from('answers', answers.selfIdentification[key]),
  ]),
];

/**
 * Fits an answer to a choice field: the option equal to it, then the option containing it, and for
 * a decline the option that declines. A free-text field takes the answer as it is.
 */
const fitToOptions = (value: string, { options }: FormQuestion): null | string => {
  if (options.length === 0) {
    return value;
  }
  const wanted = normalized(value);
  const declining = wanted === 'decline';
  return (
    options.find(option => normalized(option) === wanted) ??
    options.find(option => !declining && normalized(option).startsWith(`${wanted} `)) ??
    options.find(option => normalized(option) === normalized(regionName(value) ?? '')) ??
    (declining ? options.find(option => DeclineOption.test(option)) : undefined) ??
    null
  );
};

const customAnswer = (label: string, { answers }: AnswerContext): Candidate => {
  const match = answers.custom.find(({ question }) => normalized(question) === normalized(label));
  return match === undefined ? null : { source: 'custom', value: match.answer };
};

const fitted = (
  label: string,
  question: FormQuestion,
  candidate: Candidate,
): null | ResolvedAnswer => {
  const value = candidate === null ? null : fitToOptions(candidate.value, question);
  return candidate === null || value === null ? null : { label, source: candidate.source, value };
};

/**
 * Answers one application-form question from Nick's data, or reports it unanswered.
 *
 * An answer saved for this exact question takes precedence; then each question category whose
 * pattern matches is tried in order. For a choice field the answer must fit one of its options, so
 * a category whose answer the options do not admit gives way to the next, and a question no
 * category fits is reported unanswered rather than forced.
 *
 * @param {FormQuestion} question The question as the form reader reported it.
 * @param {AnswerContext} context The answers, preferences, profile and competencies.
 *
 * @returns {ResolvedAnswer} The answer and its source, or the question marked unanswered.
 */
export const resolveAnswer = (question: FormQuestion, context: AnswerContext): ResolvedAnswer => {
  const label = question.label.trim();
  return (
    [
      customAnswer(label, context),
      ...Resolvers.filter(([pattern]) => pattern.test(label)).map(([, resolve]) =>
        resolve(label, context, question),
      ),
    ]
      .map(candidate => fitted(label, question, candidate))
      .find((answer): answer is ResolvedAnswer => answer !== null) ?? { label, unanswered: true }
  );
};
