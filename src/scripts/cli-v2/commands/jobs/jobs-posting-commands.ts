import { text } from 'node:stream/consumers';

import { Command, Option } from 'clipanion';
import { z } from 'zod';

import { resolveSessionContext } from '~/scripts/job-search/context';
import {
  attachDescription,
  listPostings,
  recordScore,
  reviewPosting,
  reviewQueue,
} from '~/scripts/job-search/postings';
import { PostingStatuses, ReviewDecisions } from '~/scripts/job-search/schemas';

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
    examples: [['Show a posting', '$0 jobs posting show 4471755128']],
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

/**
 * Records the scoring agent's assessment of a pending posting.
 */
export class JobsScoreRecordCommand extends JsonCommand {
  public static override paths = [['jobs', 'score', 'record']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: "Record the scoring agent's assessment of a pending posting.",
    details: `
      Reads the assessment as JSON from standard input — \`total\`, \`dimensions\`,
      \`dealbreakers\`, \`gaps\`, \`flags\` and \`rationale\` — and moves the posting to the queue,
      the maybe list or the dropped postings by the thresholds in \`preferences.yaml\`.
    `,
    examples: [['Record a score', '$0 jobs score record 4471755128 < score.json']],
  });
  public id = Option.String({ name: 'id', required: true });

  protected async run(): Promise<JsonResult> {
    const input = await text(this.context.stdin);
    let score: unknown;
    try {
      score = JSON.parse(input);
    } catch (error) {
      throw new Error('The score on standard input is not valid JSON.', { cause: error });
    }
    const posting = await recordScore(await resolveSessionContext(), this.id, score);
    return { id: posting.id, status: posting.status, total: posting.score?.total ?? null };
  }
}

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
      ['Approve a posting', '$0 jobs review 4471755128 --decision approved'],
      ['Skip a posting', '$0 jobs review 4471755128 --decision skipped --reason "too backend"'],
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
