import { Command, Option } from 'clipanion';
import { z } from 'zod';

import { resolveSessionContext } from '~/scripts/job-search/context';
import { attachDescription, listPostings } from '~/scripts/job-search/postings';
import { PostingStatuses } from '~/scripts/job-search/schemas';

import { zodValidator } from '../../args/zod-validator';
import { JsonCommand, type JsonResult } from '../json-command';

/**
 * Moves a posting's text, saved by the `job-detail` page script, into its ledger record.
 */
export class JobsPostingDescribeCommand extends JsonCommand {
  public static override paths = [['jobs', 'posting', 'describe']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: "Move a posting's saved text into its ledger record.",
    details: `
      Reads the file the \`job-detail\` page script saved through the browser server's
      \`evaluate_script\` \`filePath\`, which must lie in \`build/job-search/\`, attaches the
      text to the posting it names, and deletes the file.
    `,
    examples: [
      ['Attach a saved posting', '$0 jobs posting describe --from build/job-search/4471.json'],
    ],
  });
  public from = Option.String('--from', {
    description: 'The saved file, in build/job-search/.',
    required: true,
  });

  protected async run(): Promise<JsonResult> {
    const { description, id } = await attachDescription(await resolveSessionContext(), this.from);
    return { characters: description?.length ?? 0, id, status: 'described' };
  }
}

/**
 * Prints one posting from the ledger in full, description included, for the scoring agent.
 */
export class JobsPostingShowCommand extends JsonCommand {
  public static override paths = [['jobs', 'posting', 'show']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'Print one posting from the ledger, description included.',
    examples: [['Show a posting', '$0 jobs posting show 4012345678']],
  });
  public id = Option.String({ name: 'id', required: true });

  protected async run(): Promise<JsonResult> {
    const { store } = await resolveSessionContext();
    const posting = await store.getPosting(this.id);
    if (posting === null) {
      throw new Error(`There is no posting '${this.id}' in the ledger.`);
    }
    return { posting, status: 'ok' };
  }
}

/**
 * Lists the postings with the given statuses, without their descriptions.
 */
export class JobsPostingListCommand extends JsonCommand {
  public static override paths = [['jobs', 'posting', 'list']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'List the postings with the given statuses, without their descriptions.',
    examples: [['List the postings pending their score', '$0 jobs posting list --status pending']],
  });
  public statuses = Option.Array('--status', {
    description: 'A status to include; repeatable.',
    required: true,
    validator: zodValidator(z.array(z.enum(PostingStatuses))),
  });

  protected async run(): Promise<JsonResult> {
    const postings = await listPostings(await resolveSessionContext(), this.statuses);
    return {
      postings: postings.map(({ description, ...posting }) => ({
        ...posting,
        described: description !== null,
      })),
      status: 'ok',
    };
  }
}
