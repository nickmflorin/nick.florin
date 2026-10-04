import { text } from 'node:stream/consumers';

import { Command, Option } from 'clipanion';
import { z } from 'zod';

import { loadAnswerContext } from '~/scripts/job-search/applying/answer-context';
import { FormFieldTypes, resolveAnswer } from '~/scripts/job-search/applying/answers';
import { saveCustomAnswer } from '~/scripts/job-search/applying/applications';
import { resolveSessionContext } from '~/scripts/job-search/context';

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
