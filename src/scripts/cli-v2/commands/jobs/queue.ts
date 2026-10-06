import { Command } from 'clipanion';

import { resolveSessionContext } from '~/scripts/job-search/context';
import { reviewQueue } from '~/scripts/job-search/postings';

import { JsonCommand, type JsonResult } from '../json-command';

/**
 * Prints the review queue: the queued and maybe postings awaiting a decision, highest score first.
 */
export class JobsQueueShowCommand extends JsonCommand {
  public static override paths = [['jobs', 'queue', 'show']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'Print the postings awaiting review, highest score first.',
    examples: [['Show the queue', '$0 jobs queue show']],
  });

  protected async run(): Promise<JsonResult> {
    return { postings: await reviewQueue(await resolveSessionContext()), status: 'ok' };
  }
}
