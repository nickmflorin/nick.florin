import { text } from 'node:stream/consumers';

import { Command, Option } from 'clipanion';
import { z } from 'zod';

import {
  approveCoverLetter,
  readCoverLetter,
  readVoiceSamples,
  saveCoverLetter,
} from '~/scripts/job-search/applying/cover-letters';
import { requirePosting } from '~/scripts/job-search/applying/requirements';
import { resolveSessionContext } from '~/scripts/job-search/context';

import { JsonCommand, type JsonResult } from '../json-command';

/**
 * Prints what a cover letter for a posting is drafted from.
 */
export class JobsCoverLetterContextCommand extends JsonCommand {
  public static override paths = [['jobs', 'cover-letter', 'context']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'Print what a cover letter for a posting is drafted from.',
    details: `
      The posting's company, title, description and fit assessment, the samples of Nick's writing
      in \`voice.md\` (or \`null\` when he has provided none), and any letter already drafted. The
      profile digest comes from \`jobs profile digest\`.
    `,
    examples: [['Read the drafting context', '$0 jobs cover-letter context 4012345678']],
  });
  public id = Option.String({ name: 'id', required: true });

  protected async run(): Promise<JsonResult> {
    const context = await resolveSessionContext();
    const [{ company, description, score, title }, voice, letter] = await Promise.all([
      requirePosting(context, this.id),
      readVoiceSamples(context.dataDirectory),
      readCoverLetter(context.dataDirectory, this.id),
    ]);
    return { letter, posting: { company, description, score, title }, status: 'ok', voice };
  }
}

const DraftSchema = z
  .object({ citations: z.array(z.string()).default([]), text: z.string() })
  .strict();

/**
 * Saves a drafted cover letter, read from standard input.
 */
export class JobsCoverLetterSaveCommand extends JsonCommand {
  public static override paths = [['jobs', 'cover-letter', 'save']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'Save a drafted cover letter, read from standard input.',
    details: `
      Reads \`{ "text": …, "citations": [ … ] }\` from standard input: the letter as Markdown
      paragraphs, and for each claim it makes, the role or project behind it, for Nick's review.
      Replaces any earlier draft for the posting. A saved draft is unapproved: it is attached to no
      application until Nick approves it with \`jobs cover-letter approve\`.
    `,
    examples: [['Save a draft', '$0 jobs cover-letter save 4012345678 < letter.json']],
  });
  public id = Option.String({ name: 'id', required: true });

  protected async run(): Promise<JsonResult> {
    const raw: unknown = JSON.parse(await text(this.context.stdin));
    const draft = DraftSchema.safeParse(raw);
    if (!draft.success) {
      throw new Error(`The draft on standard input is invalid: ${draft.error.message}`);
    }
    const letter = await saveCoverLetter(await resolveSessionContext(), this.id, draft.data);
    return { id: letter.id, status: 'drafted' };
  }
}

/**
 * Prints a posting's cover letter.
 */
export class JobsCoverLetterShowCommand extends JsonCommand {
  public static override paths = [['jobs', 'cover-letter', 'show']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: "Print a posting's cover letter and whether it is approved.",
    examples: [['Show a letter', '$0 jobs cover-letter show 4012345678']],
  });
  public id = Option.String({ name: 'id', required: true });

  protected async run(): Promise<JsonResult> {
    const { dataDirectory } = await resolveSessionContext();
    const letter = await readCoverLetter(dataDirectory, this.id);
    return letter === null ? { status: 'none' } : { letter, status: 'ok' };
  }
}

/**
 * Approves a posting's drafted cover letter. Reserved for Nick, and denied to agents.
 */
export class JobsCoverLetterApproveCommand extends JsonCommand {
  public static override paths = [['jobs', 'cover-letter', 'approve']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: "Approve a posting's drafted cover letter for attaching. Reserved for Nick.",
    details: `
      Only an approved letter is attached to an application, so that no letter reaches an employer
      unseen. Read it first with \`jobs cover-letter show\`. Agents are denied this command.
    `,
    examples: [['Approve a letter', '$0 jobs cover-letter approve 4012345678']],
  });
  public id = Option.String({ name: 'id', required: true });

  protected async run(): Promise<JsonResult> {
    const letter = await approveCoverLetter(await resolveSessionContext(), this.id);
    return { approvedAt: letter.approvedAt, id: letter.id, status: 'approved' };
  }
}
