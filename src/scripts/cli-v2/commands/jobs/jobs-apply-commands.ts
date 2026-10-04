import { text } from 'node:stream/consumers';

import { Command, Option } from 'clipanion';
import { z } from 'zod';

import {
  competenciesNamedIn,
  loadAnswerContext,
  StandardQuestions,
} from '~/scripts/job-search/applying/answer-context';
import { FormFieldTypes, resolveAnswer } from '~/scripts/job-search/applying/answers';
import {
  markFilled,
  markSubmitted,
  packetFileFor,
  renderPacket,
  saveCustomAnswer,
} from '~/scripts/job-search/applying/applications';
import { requireApprovedResume, requirePosting } from '~/scripts/job-search/applying/requirements';
import { resolveSessionContext } from '~/scripts/job-search/context';
import { writeFileAtomically } from '~/scripts/job-search/fs';

import { JsonCommand, type JsonResult } from '../json-command';

const FormQuestionsSchema = z.array(
  z
    .object({
      label: z.string().trim().min(1),
      options: z.array(z.string()).default([]),
      type: z.enum(FormFieldTypes),
    })
    .strict(),
);

/**
 * Answers application-form questions from Nick's data, reporting the ones it cannot answer.
 */
export class JobsAnswersResolveCommand extends JsonCommand {
  public static override paths = [['jobs', 'answers', 'resolve']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: "Answer application-form questions from Nick's data.",
    details: `
      Reads a JSON array of questions — \`label\`, \`type\` and, for a choice field, \`options\` —
      from standard input. Each comes back with its value and the source it came from, or marked
      \`unanswered\`, which means Nick answers it: never fill an unanswered question with a guess.
    `,
    examples: [['Resolve the questions of a form', '$0 jobs answers resolve < questions.json']],
  });

  protected async run(): Promise<JsonResult> {
    const parsed = FormQuestionsSchema.safeParse(JSON.parse(await text(this.context.stdin)));
    if (!parsed.success) {
      throw new Error(`The questions on standard input are invalid: ${parsed.error.message}`);
    }
    const answerContext = await loadAnswerContext(await resolveSessionContext());
    return {
      answers: parsed.data.map(question => resolveAnswer(question, answerContext)),
      status: 'ok',
    };
  }
}

/**
 * Saves Nick's answer to a question the data did not answer.
 */
export class JobsAnswersAddCommand extends JsonCommand {
  public static override paths = [['jobs', 'answers', 'add']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: "Save Nick's answer to a form question, for every later form that asks it.",
    examples: [
      [
        'Save an answer',
        '$0 jobs answers add --question "Are you willing to relocate?" --answer No',
      ],
    ],
  });
  public answer = Option.String('--answer', { description: "Nick's answer.", required: true });
  public question = Option.String('--question', {
    description: 'The question, as the form asked it.',
    required: true,
  });

  protected async run(): Promise<JsonResult> {
    await saveCustomAnswer(await resolveSessionContext(), {
      answer: this.answer,
      question: this.question,
    });
    return { question: this.question, status: 'saved' };
  }
}

/**
 * Writes the answer packet for a posting applied to by hand.
 */
export class JobsPacketBuildCommand extends JsonCommand {
  public static override paths = [['jobs', 'packet', 'build']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'Write the answer packet for a posting applied to by hand.',
    details: `
      Writes \`packets/<id>.md\` in the private data directory: where to apply, whether that needs
      an account, the approved resume to attach, the standard answers, and the years of experience
      with each competency the description names. Requires an approved resume.
    `,
    examples: [['Build a packet', '$0 jobs packet build 4012345679']],
  });
  public id = Option.String({ name: 'id', required: true });

  protected async run(): Promise<JsonResult> {
    const context = await resolveSessionContext();
    const [posting, resume, answerContext] = await Promise.all([
      requirePosting(context, this.id),
      requireApprovedResume(context.dataDirectory),
      loadAnswerContext(context),
    ]);
    const file = packetFileFor(context.dataDirectory, posting.id);
    await writeFileAtomically(
      file,
      renderPacket({
        answers: StandardQuestions.map(question => resolveAnswer(question, answerContext)),
        posting,
        resumeFile: resume.file,
        years: competenciesNamedIn(posting.description ?? '', answerContext.competencies),
      }),
    );
    return { path: file, status: 'built' };
  }
}

/**
 * Records that a posting's application has been filled and awaits Nick's submission.
 */
export class JobsApplicationFilledCommand extends JsonCommand {
  public static override paths = [['jobs', 'application', 'filled']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: "Record that a posting's application is filled and awaits Nick's submission.",
    details: `
      A form-filled application must have been verified with \`jobs apply check\`: every planned
      value seen in the form, and the approved resume seen attached. Pass \`--by-hand\` only for an
      application Nick filled himself from its answer packet.
    `,
    examples: [
      ['Record a filled application', '$0 jobs application filled 4012345678'],
      [
        'Record an application Nick filled by hand',
        '$0 jobs application filled 4012345679 --by-hand',
      ],
    ],
  });
  public byHand = Option.Boolean('--by-hand', false, {
    description: 'Nick filled the application himself, from its answer packet.',
  });
  public id = Option.String({ name: 'id', required: true });

  protected async run(): Promise<JsonResult> {
    const posting = await markFilled(await resolveSessionContext(), this.id, {
      byHand: this.byHand,
    });
    return { id: posting.id, status: posting.status };
  }
}

/**
 * Records that Nick has submitted a filled application.
 */
export class JobsApplicationSubmittedCommand extends JsonCommand {
  public static override paths = [['jobs', 'application', 'submitted']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'Record that Nick has submitted a filled application.',
    details: `
      Only Nick submits. Run this once he has said he submitted the application, never on the
      strength of a form having been filled. Discards the application's draft and staged resume.
    `,
    examples: [['Record a submission', '$0 jobs application submitted 4012345678']],
  });
  public id = Option.String({ name: 'id', required: true });

  protected async run(): Promise<JsonResult> {
    const posting = await markSubmitted(await resolveSessionContext(), this.id);
    return { id: posting.id, status: posting.status };
  }
}
