import { Command, Option } from 'clipanion';
import { z } from 'zod';

import { resolveSessionContext } from '~/scripts/job-search/context';
import { buildLearningReport } from '~/scripts/job-search/learning/report';

import { zodValidator } from '../../args/zod-validator';
import { JsonCommand, type JsonResult } from '../json-command';

/**
 * How many days back the report looks when `--days` is not given.
 */
const DefaultDays = 30;

/**
 * Prints what the job search has learned: each source's yield, and the reasons for skips.
 */
export class JobsLearningReportCommand extends JsonCommand {
  public static override paths = [['jobs', 'learning', 'report']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: "Report each search's yield and Nick's skip reasons, for proposing edits.",
    details: `
      Over the postings first seen in the last \`--days\` (30 by default): for the recommendations
      and each saved search, the postings it led to, how many were scored, and how many scored into
      the queue, with \`barren\` marking a source that has led to many postings and none worth
      applying to; and the reasons Nick gave for the postings he skipped. Proposals drawn from it —
      retiring a barren search, a new exclusion — are put to Nick, never written unasked.
    `,
    examples: [['Report the last month', '$0 jobs learning report']],
  });
  public days = Option.String('--days', {
    description: 'How many days back to look.',
    validator: zodValidator(z.coerce.number().int().positive()),
  });

  protected async run(): Promise<JsonResult> {
    const context = await resolveSessionContext();
    const report = buildLearningReport((await context.store.listPostings()).records, {
      days: this.days ?? DefaultDays,
      now: context.clock.now(),
      scoring: context.preferences.scoring,
    });
    return { ...report, status: 'ok' };
  }
}
