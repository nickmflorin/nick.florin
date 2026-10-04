import { Command, Option } from 'clipanion';
import { z } from 'zod';

import { BudgetKinds } from '~/scripts/job-search/budget/budget';
import { resolveSessionContext } from '~/scripts/job-search/context';
import { takeBudget } from '~/scripts/job-search/session';

import { zodValidator } from '../../args/zod-validator';
import { JsonCommand, type JsonResult } from '../json-command';

/**
 * Takes one unit of LinkedIn activity from the day's budget. The browser is driven only after this
 * command grants the unit, so that the daily limits and the pacing between page loads are enforced
 * by code rather than by the discipline of whatever is driving the browser.
 */
export class JobsBudgetTakeCommand extends JsonCommand {
  public static override paths = [['jobs', 'budget', 'take']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: "Take one unit of LinkedIn activity from the day's budget.",
    details: `
      Call before every LinkedIn page load (\`page-view\`) and before filling every Easy Apply form
      (\`easy-apply-fill\`). A page view returns only once the configured delay since the previous
      one has passed. Refused, with the abort exit code, during a cooldown or once the day's limit
      is spent.
    `,
    examples: [
      ['Before a page load', '$0 jobs budget take page-view'],
      ['Before filling an Easy Apply form', '$0 jobs budget take easy-apply-fill'],
    ],
  });
  public kind = Option.String({
    name: 'kind',
    required: true,
    validator: zodValidator(z.enum(BudgetKinds)),
  });

  protected async run(): Promise<JsonResult> {
    const decision = await takeBudget(await resolveSessionContext(), this.kind);
    return decision.status === 'refused'
      ? decision
      : { remaining: decision.remaining, status: 'granted', waitedMs: decision.waitMs };
  }
}
