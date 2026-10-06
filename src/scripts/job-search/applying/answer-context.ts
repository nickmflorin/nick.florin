import { configFileIn } from '../config-files';
import { toWords } from '../ledger/fingerprint';
import { readYamlRecord } from '../ledger/yaml-records';
import { buildProfileDigest } from '../profile/digest';
import { loadCareerContent, loadProfileName } from '../profile/load';
import { AnswersSchema } from '../schemas';
import { type SessionContext } from '../session';

import { type AnswerContext, type FormQuestion } from './answers';

/**
 * The questions an answer packet answers in advance: those nearly every application form asks.
 */
export const StandardQuestions: readonly FormQuestion[] = [
  'First name',
  'Last name',
  'Email',
  'Phone',
  'City',
  'LinkedIn profile',
  'GitHub',
  'Website',
  'Are you legally authorized to work in the United States?',
  'Will you now or in the future require visa sponsorship?',
  'When can you start?',
  'What are your salary expectations?',
  'How did you hear about us?',
  'Gender',
  'Race / ethnicity',
  'Veteran status',
  'Disability status',
].map(label => ({ label, options: [], type: 'text' }));

/**
 * Loads everything a form question is answered from: the saved answers and preferences, the name
 * from the profile fixture, and the competencies with their years from the profile digest.
 *
 * @param {SessionContext} context The data directory, the preferences and the clock.
 *
 * @throws {Error} If `answers.yaml` is missing or invalid.
 *
 * @returns {Promise<AnswerContext>} Everything a question can be answered from.
 */
export const loadAnswerContext = async (context: SessionContext): Promise<AnswerContext> => {
  const [answers, content, profile] = await Promise.all([
    readYamlRecord(configFileIn(context.dataDirectory, 'answers'), AnswersSchema),
    loadCareerContent(),
    loadProfileName(),
  ]);
  if (answers === null) {
    throw new Error('There is no answers.yaml. Run the job-search setup first.');
  }
  const now = context.clock.now();
  const digest = buildProfileDigest(content, now);
  return {
    answers,
    competencies: digest.competencies,
    employers: digest.roles.map(({ company }) => company),
    now,
    preferences: context.preferences,
    profile,
  };
};

/**
 * Lists the competencies a posting's description names, with their years, for the packet's years
 * table: those whose label appears in the description as a run of whole words.
 *
 * @param {string} description The posting's text.
 * @param {AnswerContext['competencies']} competencies The digest's competencies.
 *
 * @returns {{ readonly label: string; readonly years: number }[]}
 *   Each named competency with its years, in the digest's order.
 */
export const competenciesNamedIn = (
  description: string,
  competencies: AnswerContext['competencies'],
): { readonly label: string; readonly years: number }[] => {
  const text = ` ${toWords(description).join(' ')} `;
  return competencies
    .filter(({ label, years }) => years > 0 && text.includes(` ${toWords(label).join(' ')} `))
    .map(({ label, years }) => ({ label, years }));
};
