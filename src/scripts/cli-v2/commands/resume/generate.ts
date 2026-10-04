import { Command, Option } from 'clipanion';
import { z } from 'zod';

import { buildArtifact } from '~/scripts/generate-resume/artifact';
import { emitStaticHtml } from '~/scripts/generate-resume/html';
import { generatePdf } from '~/scripts/generate-resume/pdf';

import { zodValidator } from '../../args/zod-validator';
import { BaseCommand } from '../base-command';

/**
 * The steps of resume generation, in the order they run: the static HTML, the PDF printed from it,
 * and the artifact built from both.
 */
const Steps = ['html', 'pdf', 'artifact'] as const;

/**
 * Generates the resume document: its static HTML, the PDF printed from it, and the artifact.
 */
export class ResumeGenerateCommand extends BaseCommand {
  public static override paths = [['resume', 'generate']];
  public static usage = Command.Usage({
    category: 'Resume',
    description: 'Generate the resume: its static HTML, its PDF and its artifact.',
    details: `
      Runs every step by default, in order. Pass \`--step\` once per step to run only those. A PDF
      carries a provenance sidecar recording the commit and any uncommitted resume sources it was
      generated from, which \`jobs resume approve\` reads.
    `,
    examples: [
      ['Generate everything', '$0 resume generate'],
      ['Print the PDF only', '$0 resume generate --step pdf'],
    ],
  });
  protected readonly label = 'Resume generation';
  public steps = Option.Array('--step', {
    description: 'A step to run: html, pdf or artifact; repeatable. Every step by default.',
    validator: zodValidator(z.array(z.enum(Steps))),
  });

  protected async run(): Promise<void> {
    const requested = this.steps ?? Steps;
    const generatedAt = new Date();
    if (requested.includes('html')) {
      await this.output.spin('Emitting the static HTML', () => emitStaticHtml());
    }
    if (requested.includes('pdf')) {
      const pdf = await this.output.spin('Printing the PDF', () => generatePdf(generatedAt));
      this.output.info(`Printed ${pdf}.`);
    }
    if (requested.includes('artifact')) {
      await this.output.spin('Building the artifact', () => buildArtifact());
    }
    this.output.outro('The resume is generated.');
  }
}
