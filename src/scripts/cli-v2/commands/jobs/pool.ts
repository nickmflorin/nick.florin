import { Command, Option } from 'clipanion';
import { z } from 'zod';

import { resolveSessionContext } from '~/scripts/job-search/context';
import { nextFromPool } from '~/scripts/job-search/discovery/pool';

import { zodValidator } from '../../args/zod-validator';
import { JsonCommand, type JsonResult } from '../json-command';

/**
 * How many pooled candidates are returned when `--cap` is not given: about as many as one run opens
 * while leaving the day's page budget well clear of its limit.
 */
const DefaultCap = 20;

/**
 * Prints the most promising unopened candidates in a run's pool.
 */
export class JobsPoolNextCommand extends JsonCommand {
  public static override paths = [['jobs', 'pool', 'next']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: "List the most promising unopened candidates in a run's pool.",
    details: `
      The pool holds every card-stage survivor of the run, once each by company and title. They are
      ranked by listed pay at or above the floor, then by an application needing no account, then by
      recency; candidates already recorded in the ledger — opened, or seen in an earlier run — are
      left out. \`remaining\` counts the unopened candidates beyond the cap.
    `,
    examples: [['List the next candidates to open', '$0 jobs pool next --run 2026-10-04-1']],
  });
  public cap = Option.String('--cap', {
    description: 'How many candidates to list at most.',
    validator: zodValidator(z.coerce.number().int().positive()),
  });
  public runId = Option.String('--run', { description: 'The run.', required: true });

  protected async run(): Promise<JsonResult> {
    return {
      ...(await nextFromPool(await resolveSessionContext(), this.runId, this.cap ?? DefaultCap)),
      status: 'ok',
    };
  }
}
