import { Command, Option } from 'clipanion';
import { z } from 'zod';

import { resolveSessionContext } from '~/scripts/job-search/context';
import { reviewPosting } from '~/scripts/job-search/postings';
import { ReviewDecisions } from '~/scripts/job-search/schemas';

import { zodValidator } from '../../args/zod-validator';
import { JsonCommand, type JsonResult } from '../json-command';

/**
 * Records a person's review of a queued or maybe posting.
 */
export class JobsReviewCommand extends JsonCommand {
  public static override paths = [['jobs', 'review']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'Approve or skip a posting awaiting review.',
    details: `
      An approval keeps the posting queued for applying; a skip sets it aside. Give the reason
      Nick gave, in a few words, so that the learning loop can propose preference changes from it.
    `,
    examples: [
      ['Approve a posting', '$0 jobs review 4012345678 --decision approved'],
      ['Skip a posting', '$0 jobs review 4012345678 --decision skipped --reason "too backend"'],
    ],
  });
  public decision = Option.String('--decision', {
    description: 'approved or skipped.',
    required: true,
    validator: zodValidator(z.enum(ReviewDecisions)),
  });
  public id = Option.String({ name: 'id', required: true });
  public reason = Option.String('--reason', {
    description: 'The reason given for the decision, in a few words.',
  });

  protected async run(): Promise<JsonResult> {
    const posting = await reviewPosting(await resolveSessionContext(), this.id, {
      decision: this.decision,
      reason: this.reason ?? null,
    });
    return { id: posting.id, status: posting.status };
  }
}
