import { Command, Option } from 'clipanion';
import { z } from 'zod';

import { resolveSessionContext } from '~/scripts/job-search/context';
import { RunEndings } from '~/scripts/job-search/schemas';
import { finishRun, startRun } from '~/scripts/job-search/session';

import { zodValidator } from '../../args/zod-validator';
import { JsonCommand, type JsonResult } from '../json-command';

/**
 * Starts a job-search run, taking one of the day's runs, and records the run-only adjustments to
 * the saved preferences that it was started with.
 */
export class JobsRunStartCommand extends JsonCommand {
  public static override paths = [['jobs', 'run', 'start']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: "Start a job-search run, taking one of the day's runs.",
    details: `
      Refused, with the abort exit code, while a cooldown is active or once the day's runs are
      spent. Each \`--override\` is recorded on the run as given, so that every posting the run
      produces can be traced to the preferences in force when it was scored.
    `,
    examples: [
      ['Start a run with the saved preferences', '$0 jobs run start'],
      ['Start a run with an adjustment', '$0 jobs run start --override "Onsite in Boston is fine"'],
    ],
  });
  public overrides = Option.Array('--override', {
    description: 'A run-only adjustment to the saved preferences, as given; repeatable.',
  });

  protected async run(): Promise<JsonResult> {
    return startRun(await resolveSessionContext(), this.overrides ?? []);
  }
}

/**
 * Finishes a job-search run, recording why it ended. A run that ended on a security challenge also
 * starts the cooldown that suspends LinkedIn activity.
 */
export class JobsRunFinishCommand extends JsonCommand {
  public static override paths = [['jobs', 'run', 'finish']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'Finish a job-search run, recording why it ended.',
    details: `
      Ending with \`challenge\` — a CAPTCHA, an "unusual activity" page, an unexpected logout —
      starts the configured cooldown, during which every run and every page view is refused.
    `,
    examples: [
      ['Finish a run that completed', '$0 jobs run finish 2026-10-03-1 --ended-by completed'],
      [
        'Finish a run that met a challenge',
        '$0 jobs run finish 2026-10-03-1 --ended-by challenge --reason "CAPTCHA on search"',
      ],
    ],
  });
  public endedBy = Option.String('--ended-by', {
    description: 'Why the run ended.',
    required: true,
    validator: zodValidator(z.enum(RunEndings)),
  });
  public reason = Option.String('--reason', {
    description: 'What happened, recorded on the cooldown when the run ended on a challenge.',
  });
  public runId = Option.String({ name: 'run-id', required: true });

  protected async run(): Promise<JsonResult> {
    return {
      run: await finishRun(
        await resolveSessionContext(),
        this.runId,
        this.endedBy,
        this.reason ?? null,
      ),
      status: 'finished',
    };
  }
}
