import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import { z } from 'zod';

import { ChromePrintFlags, locateChrome } from '~/scripts/generate-resume/chrome';

import { configFileIn } from '../config-files';
import { pathExists, readTextFile } from '../fs';
import { readYamlRecord, writeYamlRecord } from '../ledger/yaml-records';
import { loadProfileName } from '../profile/load';
import { AnswersSchema, TimestampSchema } from '../schemas';
import { type SessionContext } from '../session';

import { requirePosting } from './requirements';

const execFileAsync = promisify(execFile);

/**
 * The directory, inside the job-search data directory, that holds the cover letters.
 */
export const CoverLetterDirectoryName = 'cover-letters';

/**
 * The file, inside the job-search data directory, holding samples of Nick's own writing that cover
 * letters are drafted to sound like.
 */
export const VoiceFileName = 'voice.md';

/**
 * A cover letter for one posting: its text, as Markdown paragraphs; the role or project behind
 * each claim it makes, for Nick's review; when it was drafted; and when Nick approved it — `null`
 * until he has. Only an approved letter is ever attached to an
 * application, so that no letter reaches an employer unseen.
 */
export const CoverLetterSchema = z
  .object({
    approvedAt: TimestampSchema.nullable(),
    citations: z.array(z.string().trim().min(1)).default([]),
    draftedAt: TimestampSchema,
    id: z.string(),
    text: z.string().trim().min(1),
  })
  .strict();

export type CoverLetter = z.infer<typeof CoverLetterSchema>;

export const coverLetterFileFor = (dataDirectory: string, id: string): string =>
  path.join(dataDirectory, CoverLetterDirectoryName, `${id}.yaml`);

export const readCoverLetter = (dataDirectory: string, id: string): Promise<CoverLetter | null> =>
  readYamlRecord(coverLetterFileFor(dataDirectory, id), CoverLetterSchema);

/**
 * Reads the samples of Nick's writing that letters are drafted to sound like, or `null` when he has
 * not provided any.
 */
export const readVoiceSamples = (dataDirectory: string): Promise<null | string> =>
  readTextFile(path.join(dataDirectory, VoiceFileName));

/**
 * Saves a drafted cover letter for a posting, replacing any earlier draft. A new draft is never
 * approved, whatever the draft it replaces was.
 *
 * @param {SessionContext} context The ledger, the clock and the data directory.
 * @param {string} id The job identifier of the posting.
 * @param {{ readonly citations: readonly string[]; readonly text: string }} draft
 *   The letter, as Markdown paragraphs, and the role or project behind each of its claims.
 *
 * @throws {Error} If the posting is not in the ledger, or the text is empty.
 *
 * @returns {Promise<CoverLetter>} The saved draft.
 */
export const saveCoverLetter = async (
  context: SessionContext,
  id: string,
  { citations, text }: { readonly citations: readonly string[]; readonly text: string },
): Promise<CoverLetter> => {
  await requirePosting(context, id);
  const letter = CoverLetterSchema.parse({
    approvedAt: null,
    citations,
    draftedAt: context.clock.now().toISOString(),
    id,
    text,
  });
  await writeYamlRecord(coverLetterFileFor(context.dataDirectory, id), letter, CoverLetterSchema);
  return letter;
};

/**
 * Records Nick's approval of a posting's drafted cover letter, which lets it be attached.
 *
 * @param {SessionContext} context The clock and the data directory.
 * @param {string} id The job identifier of the posting.
 *
 * @throws {Error} If no letter has been drafted for the posting.
 *
 * @returns {Promise<CoverLetter>} The approved letter.
 */
export const approveCoverLetter = async (
  { clock, dataDirectory }: SessionContext,
  id: string,
): Promise<CoverLetter> => {
  const letter = await readCoverLetter(dataDirectory, id);
  if (letter === null) {
    throw new Error(`No cover letter has been drafted for '${id}'.`);
  }
  const approved: CoverLetter = { ...letter, approvedAt: clock.now().toISOString() };
  await writeYamlRecord(coverLetterFileFor(dataDirectory, id), approved, CoverLetterSchema);
  return approved;
};

const escapeHtml = (text: string): string =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

/**
 * Lays a letter out as a printable page: Nick's name and contact line, the date, and the letter's
 * paragraphs, with Markdown emphasis markers removed.
 */
export const coverLetterHtml = ({
  contact,
  date,
  name,
  text,
}: {
  readonly contact: string;
  readonly date: string;
  readonly name: string;
  readonly text: string;
}): string =>
  [
    '<!doctype html>',
    '<html><head><meta charset="utf-8"><style>',
    '@page { size: letter; margin: 1in; }',
    'body { font: 11pt/1.5 Georgia, "Times New Roman", serif; color: #1a1a1a; }',
    'h1 { font-size: 16pt; margin: 0; } .contact { color: #555; margin: 2pt 0 18pt; }',
    'p { margin: 0 0 10pt; }',
    '</style></head><body>',
    `<h1>${escapeHtml(name)}</h1>`,
    `<div class="contact">${escapeHtml(contact)}</div>`,
    `<p>${escapeHtml(date)}</p>`,
    ...text
      .split(/\n\s*\n/)
      .map(paragraph =>
        paragraph
          .replace(/[*_`#]/g, '')
          .replace(/\s+/g, ' ')
          .trim(),
      )
      .filter(paragraph => paragraph !== '')
      .map(paragraph => `<p>${escapeHtml(paragraph)}</p>`),
    '</body></html>',
  ].join('\n');

/**
 * Renders an approved cover letter to a PDF in an application's staging directory, beside the
 * staged resume, with the same headless Chrome that prints the resume.
 *
 * @param {object} rendering
 *   The letter, the directory to render it into, the file name to give the PDF, and the page's
 *   name, contact line and date.
 *
 * @throws {Error} If the letter is not approved, Chrome cannot be found, or it writes no PDF.
 *
 * @returns {Promise<string>} The rendered PDF.
 */
export const renderCoverLetter = async ({
  contact,
  date,
  directory,
  fileName,
  letter,
  name,
}: {
  readonly contact: string;
  readonly date: string;
  readonly directory: string;
  readonly fileName: string;
  readonly letter: CoverLetter;
  readonly name: string;
}): Promise<string> => {
  if (letter.approvedAt === null) {
    throw new Error(`The cover letter for '${letter.id}' has not been approved.`);
  }
  await fs.mkdir(directory, { mode: 0o700, recursive: true });
  const html = path.join(directory, `${path.parse(fileName).name}.html`);
  const pdf = path.join(directory, fileName);
  await fs.writeFile(html, coverLetterHtml({ contact, date, name, text: letter.text }));
  await execFileAsync(await locateChrome(), [
    ...ChromePrintFlags,
    `--print-to-pdf=${pdf}`,
    pathToFileURL(html).href,
  ]);
  await fs.rm(html, { force: true });
  if (!(await pathExists(pdf))) {
    throw new Error(`Chrome produced no PDF for the cover letter for '${letter.id}'.`);
  }
  return pdf;
};

/**
 * A cover letter staged for an application: its PDF, the PDF's file name, and its text.
 */
export interface StagedLetter {
  readonly fileName: string;
  readonly stagedFile: string;
  readonly text: string;
}

/**
 * Stages a posting's cover letter, when Nick has approved one, beside the application's staged
 * resume: rendered under his name, with his contact line and today's date.
 *
 * @param {SessionContext} context The clock and the data directory.
 * @param {string} id The job identifier of the posting.
 * @param {string} directory The application's staging directory.
 *
 * @throws {Error} If `answers.yaml` is missing, or the letter cannot be rendered.
 *
 * @returns {Promise<StagedLetter | null>} The staged letter, or `null` when none is approved.
 */
export const stageCoverLetter = async (
  context: SessionContext,
  id: string,
  directory: string,
): Promise<null | StagedLetter> => {
  const letter = await readCoverLetter(context.dataDirectory, id);
  if (!letter?.approvedAt) {
    return null;
  }
  const [answers, { firstName, lastName }] = await Promise.all([
    readYamlRecord(configFileIn(context.dataDirectory, 'answers'), AnswersSchema),
    loadProfileName(),
  ]);
  if (answers === null) {
    throw new Error('There is no answers.yaml. Run the job-search setup first.');
  }
  const fileName = `${firstName}-${lastName}-Cover-Letter.pdf`.replace(/[^A-Za-z0-9.-]+/g, '-');
  const { city, email, phone, region } = answers.contact;
  return {
    fileName,
    stagedFile: await renderCoverLetter({
      contact: [email, phone, `${city}, ${region}`].join(' · '),
      date: context.clock
        .now()
        .toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
      directory,
      fileName,
      letter,
      name: `${firstName} ${lastName}`,
    }),
    text: letter.text,
  };
};
