import { text } from 'node:stream/consumers';

import { Command, Option } from 'clipanion';
import { z } from 'zod';

import { resolveSessionContext } from '~/scripts/job-search/context';
import { CandidatesSchema, TriageStages } from '~/scripts/job-search/schemas';
import { triageBatch } from '~/scripts/job-search/session';

import { zodValidator } from '../../args/zod-validator';
import { JsonCommand, type JsonResult } from '../json-command';

const parseCandidates = (input: string) => {
  let raw: unknown;
  try {
    raw = JSON.parse(input);
  } catch (error) {
    throw new Error('The candidates on standard input are not valid JSON.', { cause: error });
  }
  const parsed = CandidatesSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`The candidates on standard input are invalid: ${parsed.error.message}`);
  }
  return parsed.data;
};

/**
 * Triages a batch of candidate postings read in one browser pass: deduplicates them against the
 * ledger, applies the hard filters, and records the postings the triage decided on.
 */
export class JobsTriageCommand extends JsonCommand {
  public static override paths = [['jobs', 'triage']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'Deduplicate and hard-filter candidate postings read from LinkedIn.',
    details: `
      Reads a JSON array of candidates from standard input. At the \`card\` stage, facts a result
      card does not publish are deferred and survivors are not recorded; at the \`detail\` stage,
      unpublished facts are decided by the configured policies and survivors are recorded as
      pending their score. Rejections are recorded at both stages.
    `,
    examples: [
      ['Triage result cards', '$0 jobs triage --run 2026-10-03-1 --stage card < cards.json'],
      ['Triage full postings', '$0 jobs triage --run 2026-10-03-1 --stage detail < postings.json'],
    ],
  });
  public runId = Option.String('--run', {
    description: 'The open run the candidates were read in.',
    required: true,
  });
  public stage = Option.String('--stage', {
    description: 'The pass the candidates were read at: `card` or `detail`.',
    required: true,
    validator: zodValidator(z.enum(TriageStages)),
  });

  protected async run(): Promise<JsonResult> {
    const candidates = parseCandidates(await text(this.context.stdin));
    return {
      ...(await triageBatch(await resolveSessionContext(), this.runId, this.stage, candidates)),
      status: 'triaged',
    };
  }
}
