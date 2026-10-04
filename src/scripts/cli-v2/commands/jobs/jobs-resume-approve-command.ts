import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { Command, Option, UsageError } from 'clipanion';

import { OutputDir } from '~/scripts/generate-resume/config';
import { resolveConfiguredDataDirectory } from '~/scripts/job-search/configured-data-directory';
import { loadProfileName } from '~/scripts/job-search/profile/load';
import {
  approvedResumeFileName,
  approveResume,
  type GeneratedResume,
  isDraftResume,
  listGeneratedResumes,
  readApprovedResume,
} from '~/scripts/job-search/resume/approved-resume';

import { OutputAbortedError } from '../../output/output';
import { BaseCommand } from '../base-command';

const execFileAsync = promisify(execFile);

const ShortCommitLength = 7;

const describeProvenance = (resume: GeneratedResume): string => {
  if (resume.provenance === null) {
    return 'no provenance: generated before it was recorded, or its sidecar is missing';
  } else if (resume.provenance.uncommitted.length > 0) {
    return `draft: ${resume.provenance.uncommitted.length} uncommitted resume source file(s)`;
  }
  return `committed ${resume.provenance.commit.slice(0, ShortCommitLength)}`;
};

/**
 * Approves a generated resume as the one attached to every job application from now on.
 *
 * Approval is reserved for a person. The command refuses to run without an interactive terminal,
 * every confirmation is a prompt with no flag that answers it, and a resume that may be a draft
 * must have its file name typed to proceed — so that no agent, script or stray keystroke can decide
 * what employers receive.
 */
export class JobsResumeApproveCommand extends BaseCommand {
  public static override paths = [['jobs', 'resume', 'approve']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'Approve a generated resume for every job application from now on.',
    details: `
      Lists the PDFs in \`build/documents/resume/\`, opens the chosen one for inspection, and asks
      for confirmation. A PDF generated from uncommitted resume sources, or with no recorded
      provenance, must have its file name typed to proceed. Requires an interactive terminal.
    `,
    examples: [
      ['Choose from the generated resumes', '$0 jobs resume approve'],
      ['Approve a specific PDF', '$0 jobs resume approve --file Resume-Oct-03-2026-9:15am.pdf'],
    ],
  });
  protected readonly label = 'Approve a resume';
  public file = Option.String('--file', {
    description: 'The generated PDF to approve, by file name. Prompted for when omitted.',
  });

  protected async run(): Promise<void> {
    if (!this.output.isInteractive) {
      throw new UsageError(
        'Approving a resume requires an interactive terminal: it is reserved for a person.',
      );
    }
    const dataDirectory = await resolveConfiguredDataDirectory();
    const [resumes, current, name] = await Promise.all([
      listGeneratedResumes(OutputDir),
      readApprovedResume(dataDirectory),
      loadProfileName(),
    ]);
    if (current.status !== 'missing') {
      this.output.info(
        `Currently approved: '${current.manifest.sourceFile}', on ${current.manifest.approvedAt}.`,
      );
    }
    const resume = await this.chooseResume(resumes);

    this.output.info(`Opening '${resume.name}' (${describeProvenance(resume)}).`);
    await execFileAsync('open', [resume.file]);

    if (isDraftResume(resume)) {
      this.output.warn(
        `'${resume.name}' may be a draft: ${describeProvenance(resume)}. Check it carefully.`,
      );
      const typed = await this.output.text(`Type '${resume.name}' to approve it anyway.`);
      if (typed.trim() !== resume.name) {
        throw new OutputAbortedError('The file name did not match; nothing was approved.');
      }
    }
    if (
      !(await this.output.confirm(
        `Approve '${resume.name}' for every application from now on?`,
        'an interactive terminal',
      ))
    ) {
      this.output.outro('Aborted; nothing was approved.');
      return;
    }

    const manifest = await approveResume({
      dataDirectory,
      fileName: approvedResumeFileName(name),
      now: new Date(),
      resume,
    });
    this.output.success(
      `Approved '${manifest.sourceFile}', attached as '${manifest.fileName}' ` +
        `(sha256 ${manifest.sha256.slice(0, ShortCommitLength * 2)}).`,
    );
    this.output.outro('Every application now attaches this resume.');
  }

  private async chooseResume(resumes: readonly GeneratedResume[]): Promise<GeneratedResume> {
    if (resumes.length === 0) {
      throw new UsageError(
        `There are no generated resumes in '${OutputDir}'. Run 'pnpm resume:generate' first.`,
      );
    } else if (this.file !== undefined) {
      const named = resumes.find(resume => resume.name === this.file);
      if (named === undefined) {
        throw new UsageError(`There is no generated resume named '${this.file}'.`);
      }
      return named;
    }
    const chosen = await this.output.select(
      'Which generated resume should every application attach?',
      resumes.map(resume => ({
        hint: describeProvenance(resume),
        label: resume.name,
        value: resume.name,
      })),
    );
    const resume = resumes.find(candidate => candidate.name === chosen);
    if (resume === undefined) {
      throw new OutputAbortedError(`'${chosen}' is not one of the generated resumes.`);
    }
    return resume;
  }
}
