import { Command, Option } from 'clipanion';

import {
  competenciesNamedIn,
  loadAnswerContext,
  StandardQuestions,
} from '~/scripts/job-search/applying/answer-context';
import { resolveAnswer } from '~/scripts/job-search/applying/answers';
import { packetFileFor, renderPacket } from '~/scripts/job-search/applying/applications';
import { requireApprovedResume, requirePosting } from '~/scripts/job-search/applying/requirements';
import { resolveSessionContext } from '~/scripts/job-search/context';
import { writeFileAtomically } from '~/scripts/job-search/fs';

import { JsonCommand, type JsonResult } from '../json-command';

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
