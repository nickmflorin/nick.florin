import os from 'node:os';
import { type Readable } from 'node:stream';
import { text } from 'node:stream/consumers';

import { Command, Option } from 'clipanion';

import { loadAnswerContext } from '~/scripts/job-search/applying/answer-context';
import {
  checkReading,
  deferApplication,
  discardDraft,
  listHeldApplications,
  readDraft,
  recordPlan,
  startApplication,
} from '~/scripts/job-search/applying/drafts';
import { planFill } from '~/scripts/job-search/applying/fill-plan';
import {
  chooseOptionScript,
  formFillScript,
  type FormReading,
  FormReadingSchema,
  type PlannedFill,
} from '~/scripts/job-search/applying/form-scripts';
import { typeaheadQuery } from '~/scripts/job-search/applying/places';
import { delayWithinMs } from '~/scripts/job-search/budget/budget';
import { resolveSessionContext } from '~/scripts/job-search/context';

import { JsonCommand, type JsonResult } from '../json-command';

/**
 * Adds to a combobox or typeahead fill the script that chooses its option once its menu is open,
 * and, for a typeahead, the text to type to open it.
 */
const withChooser = (fill: PlannedFill) => {
  if (typeof fill.value !== 'string') {
    return fill;
  } else if (fill.widget !== 'typeahead') {
    return { ...fill, chooseFunction: chooseOptionScript(fill.value) };
  }
  const { hints, text: typeText } = typeaheadQuery(fill.value);
  return { ...fill, chooseFunction: chooseOptionScript(fill.value, hints), typeText };
};

const readFormReading = async (stdin: Readable): Promise<FormReading> => {
  const raw: unknown = JSON.parse(await text(stdin));
  const parsed = FormReadingSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`The form reading on standard input is invalid: ${parsed.error.message}`);
  }
  return parsed.data;
};

/**
 * Starts an application to an approved posting.
 */
export class JobsApplyStartCommand extends JsonCommand {
  public static override paths = [['jobs', 'apply', 'start']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'Start an application: check the account policy, stage the resume, open a draft.',
    details: `
      Refuses a posting whose application system requires an account Nick has not approved; pass
      \`--account-approved\` once he has. Otherwise stages the approved resume for upload — the
      \`resume\` path printed is the file to upload — and opens a fresh draft, replacing any earlier
      one. Requires an approved resume.
    `,
    examples: [['Start an application', '$0 jobs apply start 4012345678']],
  });
  public accountApproved = Option.Boolean('--account-approved', false, {
    description: 'Nick has approved creating an account for this application.',
  });
  public id = Option.String({ name: 'id', required: true });

  protected async run(): Promise<JsonResult> {
    const started = await startApplication(await resolveSessionContext(), this.id, {
      accountApproved: this.accountApproved,
      temporaryDirectory: os.tmpdir(),
    });
    return started.status === 'refused'
      ? started
      : {
          applyAt: started.applyAt,
          applyVia: started.applyVia,
          resume: started.draft.resume.stagedFile,
          status: 'started',
        };
  }
}

/**
 * Plans how to fill a reading of an application form, and records the plan in the draft.
 */
export class JobsApplyPlanCommand extends JsonCommand {
  public static override paths = [['jobs', 'apply', 'plan']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: "Plan how to fill a form reading from Nick's data, and print the fill script.",
    details: `
      Reads the \`form-read\` page script's result from standard input. Prints the plan — the
      native fills and the \`fillFunction\` that sets them; the comboboxes and typeaheads to choose
      through the browser server, each with the \`chooseFunction\` to run once its menu is open,
      and a typeahead with the \`typeText\` that opens it; the uploads; the comboboxes whose options
      must be probed first; and the required questions only Nick can answer — and records the
      planned values in the draft. Refuses a reading that shows a CAPTCHA challenge, or a page that
      asks to sign in.

      \`--preview\` plans without a started application and records nothing, to see what a form
      asks before applying; the resume upload is then reported unanswered.
    `,
    examples: [
      ['Plan a reading', '$0 jobs apply plan 4012345678 < reading.json'],
      ['Preview a form', '$0 jobs apply plan 4012345678 --preview < reading.json'],
    ],
  });
  public id = Option.String({ name: 'id', required: true });
  public preview = Option.Boolean('--preview', false, {
    description: 'Plan without a started application, recording nothing.',
  });

  protected async run(): Promise<JsonResult> {
    const reading = await readFormReading(this.context.stdin);
    if (reading.challenge) {
      return { reason: 'The page is showing a CAPTCHA challenge.', status: 'refused' };
    } else if (reading.signIn) {
      return {
        reason:
          'The page asks to sign in: on LinkedIn the session has lapsed; elsewhere the board ' +
          'wants an account.',
        status: 'refused',
      };
    }
    const context = await resolveSessionContext();
    const [answerContext, draft] = await Promise.all([
      loadAnswerContext(context),
      this.preview ? null : readDraft(context.dataDirectory, this.id),
    ]);
    const plan = planFill(reading, answerContext, {
      coverLetter:
        draft === null || draft.coverLetter === null
          ? null
          : { file: draft.coverLetter.stagedFile, text: draft.coverLetter.text },
      resumeFile: draft?.resume.stagedFile ?? null,
    });
    if (!this.preview) {
      await recordPlan(context, this.id, plan, reading);
    }
    return {
      ...plan,
      fillFunction: plan.fills.length === 0 ? null : formFillScript(plan.fills),
      interactive: plan.interactive.map(withChooser),
      progress: reading.progress,
      status: 'planned',
      unsupported: reading.unsupported,
    };
  }
}

/**
 * Checks a reading of a filled form against the plan recorded in the draft.
 */
export class JobsApplyCheckCommand extends JsonCommand {
  public static override paths = [['jobs', 'apply', 'check']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'Check a reading of the filled form against the planned values.',
    details: `
      Reads the \`form-read\` page script's result, taken after filling, from standard input, and
      records which planned values the form shows. Prints the values it shows differently, those
      not yet seen, whether the approved resume has been seen attached, and the blockers that keep
      the agent from submitting it — including any required field no plan covered. An application
      can be recorded as filled only once nothing is pending and the resume is verified, and
      submitted by the agent only once, in addition, nothing blocks it.
    `,
    examples: [['Check a filled form', '$0 jobs apply check 4012345678 < reading.json']],
  });
  public id = Option.String({ name: 'id', required: true });

  protected async run(): Promise<JsonResult> {
    const reading = await readFormReading(this.context.stdin);
    const check = await checkReading(await resolveSessionContext(), this.id, reading);
    return { ...check, status: check.mismatches.length === 0 ? 'ok' : 'mismatched' };
  }
}

/**
 * Pauses between the steps of an application form, for a randomized, human interval.
 */
export class JobsApplyPauseCommand extends JsonCommand {
  public static override paths = [['jobs', 'apply', 'pause']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'Pause for a randomized interval between the steps of an application form.',
    examples: [['Pause between steps', '$0 jobs apply pause']],
  });

  protected async run(): Promise<JsonResult> {
    const { clock, preferences } = await resolveSessionContext();
    const waitedMs = Math.ceil(
      delayWithinMs(preferences.limits.formStepDelaySeconds, clock.random()),
    );
    await clock.sleep(waitedMs);
    return { status: 'ok', waitedMs };
  }
}

/**
 * Discards an application that will not be submitted.
 */
export class JobsApplyDiscardCommand extends JsonCommand {
  public static override paths = [['jobs', 'apply', 'discard']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: "Discard an abandoned application's draft and staged resume.",
    examples: [['Discard an application', '$0 jobs apply discard 4012345678']],
  });
  public id = Option.String({ name: 'id', required: true });

  protected async run(): Promise<JsonResult> {
    const { dataDirectory } = await resolveSessionContext();
    return { status: (await discardDraft(dataDirectory, this.id)) ? 'discarded' : 'none' };
  }
}

/**
 * Sets an application aside for Nick.
 */
export class JobsApplyDeferCommand extends JsonCommand {
  public static override paths = [['jobs', 'apply', 'defer']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'Set an application aside for Nick, and move on to the next.',
    details: `
      For an application the agent cannot finish unattended: a question only Nick can answer, an
      account to approve, a CAPTCHA, or a submission whose confirmation never appeared. Removes the
      staged resume and keeps the draft, which \`jobs apply held\` lists for Nick. Starting the
      application again later begins a fresh draft.
    `,
    examples: [
      [
        'Defer an application',
        '$0 jobs apply defer 4012345678 --reason "Two screening questions need Nick"',
      ],
    ],
  });
  public id = Option.String({ name: 'id', required: true });
  public reason = Option.String('--reason', {
    description: 'Why the application is set aside.',
    required: true,
  });

  protected async run(): Promise<JsonResult> {
    const draft = await deferApplication(await resolveSessionContext(), this.id, this.reason);
    return { blockers: draft.blockers, id: draft.id, status: 'deferred' };
  }
}

/**
 * Lists the applications waiting on Nick.
 */
export class JobsApplyHeldCommand extends JsonCommand {
  public static override paths = [['jobs', 'apply', 'held']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'List the applications waiting on Nick, with what each needs from him.',
    examples: [['List held applications', '$0 jobs apply held']],
  });

  protected async run(): Promise<JsonResult> {
    return { held: await listHeldApplications(await resolveSessionContext()), status: 'ok' };
  }
}
