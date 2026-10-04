import { text } from 'node:stream/consumers';

import { Command, Option } from 'clipanion';

import { resolveSessionContext } from '~/scripts/job-search/context';
import { recordScore } from '~/scripts/job-search/postings';

import { JsonCommand, type JsonResult } from '../json-command';

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
    examples: [['Record a score', '$0 jobs score record 4012345678 < score.json']],
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
