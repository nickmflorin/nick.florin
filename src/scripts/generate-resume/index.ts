import { isError } from '~/application/errors';
import { getNamedArgument } from '~/scripts/cli/args';
import { stdout } from '~/support';

import { buildArtifact } from './artifact';
import { emitStaticHtml } from './html';
import { generatePdf } from './pdf';

/**
 * The steps of the pipeline, in the order they run.
 *
 * Both the PDF and the artifact are built from the files the HTML step emits, so a run that omits
 * it consumes whatever a previous run left on disk.
 */
const Steps = ['html', 'pdf', 'artifact'] as const;

type Step = (typeof Steps)[number];

const isStep = (value: string): value is Step => Steps.includes(value as Step);

const requestedSteps = (): Step[] => {
  const requested = getNamedArgument('steps', { defaultValue: Steps.join(',') })
    .split(',')
    .map(step => step.trim().toLowerCase())
    .filter(step => step.length !== 0);

  const unrecognized = requested.filter(step => !isStep(step));
  if (unrecognized.length !== 0) {
    throw new Error(
      `The step(s) '${unrecognized.join("', '")}' are not recognized. The available steps are ` +
        `'${Steps.join("', '")}'.`,
    );
  }
  return Steps.filter(step => requested.includes(step));
};

const generateResume = async (): Promise<void> => {
  const steps = requestedSteps();
  const generatedAt = new Date();

  stdout.info(`Generating the resume document: ${steps.join(', ')}.`);

  if (steps.includes('html')) {
    await emitStaticHtml();
  }
  if (steps.includes('pdf')) {
    await generatePdf(generatedAt);
  }
  if (steps.includes('artifact')) {
    await buildArtifact();
  }
};

void generateResume().catch((e: unknown) => {
  stdout.error(isError(e) ? e : String(e));
  process.exit(1);
});
