import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import { promisify } from 'node:util';

import { parse, stringify } from 'yaml';
import { z } from 'zod';

const execFileAsync = promisify(execFile);

/**
 * The paths whose contents decide what the generated resume says or how it looks. Uncommitted
 * changes anywhere else in the working tree do not make a resume a draft.
 */
export const ResumeSourcePaths = [
  'public/documents',
  'src/documents',
  'src/scripts/generate-resume',
  'src/styles/document',
];

const ProvenanceSuffix = '.provenance.yaml';

/**
 * The state of the resume sources that a rendering was made from: the commit, and the resume
 * source files that differed from it.
 *
 * A non-empty `uncommitted` list marks the rendering as made mid-iteration, from edits that were
 * never committed and may never have been finished.
 */
export const SourceProvenanceSchema = z
  .object({
    commit: z.string().regex(/^[a-f0-9]{40}$/),
    uncommitted: z.array(z.string()),
  })
  .strict();

export type SourceProvenance = z.infer<typeof SourceProvenanceSchema>;

/**
 * The record written beside each generated resume PDF: the source provenance of the HTML it was
 * printed from, the time it was printed, and its hash.
 */
export const ResumeProvenanceSchema = SourceProvenanceSchema.extend({
  generatedAt: z.string().datetime(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
}).strict();

export type ResumeProvenance = z.infer<typeof ResumeProvenanceSchema>;

export const provenanceFileFor = (rendering: string): string => `${rendering}${ProvenanceSuffix}`;

export const sha256OfFile = async (file: string): Promise<string> =>
  createHash('sha256')
    .update(await fs.readFile(file))
    .digest('hex');

const git = async (repository: string, args: readonly string[]): Promise<string> =>
  (await execFileAsync('git', [...args], { cwd: repository })).stdout;

/**
 * Matches the two-character status of a porcelain entry that is a rename or a copy, which the `-z`
 * format follows with a separate entry holding the original path.
 */
const RenameOrCopyStatus = /^(?:[RC].|.[RC])$/u;

/**
 * Lists the resume source files that differ from the current commit, including untracked ones.
 *
 * The `-z` porcelain format separates entries with NUL rather than quoting paths, and prefixes each
 * with a two-character status and a space. A rename or copy is followed by an entry holding its
 * original path, which is skipped: only the path that now exists is reported.
 */
const uncommittedResumeSources = async (repository: string): Promise<string[]> =>
  (
    await git(repository, [
      'status',
      '--porcelain',
      '-z',
      '--untracked-files=all',
      '--',
      ...ResumeSourcePaths,
    ])
  )
    .split('\0')
    .reduce<{ readonly paths: string[]; readonly skipNext: boolean }>(
      ({ paths, skipNext }, entry) =>
        skipNext || entry === ''
          ? { paths, skipNext: false }
          : {
              paths: [...paths, entry.slice(3)],
              skipNext: RenameOrCopyStatus.test(entry.slice(0, 2)),
            },
      { paths: [], skipNext: false },
    ).paths;

/**
 * Captures the state of the resume sources in a repository: its current commit, and the resume
 * source files that differ from it.
 *
 * @param {string} repository The root of the repository's working tree.
 *
 * @throws {Error} If git cannot be run in the repository.
 *
 * @returns {Promise<SourceProvenance>} The commit and the uncommitted resume source files.
 */
export const captureSourceProvenance = async (repository: string): Promise<SourceProvenance> => {
  const [commit, uncommitted] = await Promise.all([
    git(repository, ['rev-parse', 'HEAD']),
    uncommittedResumeSources(repository),
  ]);
  return SourceProvenanceSchema.parse({ commit: commit.trim(), uncommitted });
};

/**
 * Lists the resume source files that have changed since a commit: those changed in the commits
 * since, and those changed in the working tree now.
 *
 * @param {string} repository The root of the repository's working tree.
 * @param {string} commit The commit the comparison starts from.
 *
 * @throws {Error} If git cannot be run in the repository, or does not know the commit.
 *
 * @returns {Promise<string[]>} The changed resume source files, each listed once.
 */
export const resumeSourcesChangedSince = async (
  repository: string,
  commit: string,
): Promise<string[]> => {
  const [committed, uncommitted] = await Promise.all([
    git(repository, ['diff', '--name-only', commit, 'HEAD', '--', ...ResumeSourcePaths]),
    uncommittedResumeSources(repository),
  ]);
  return [
    ...new Set([...committed.split('\n').filter(line => line.trim() !== ''), ...uncommitted]),
  ];
};

const readProvenance = async <T>(
  file: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
): Promise<null | T> => {
  try {
    const parsed = schema.safeParse(parse(await fs.readFile(file, 'utf-8')));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

/**
 * Records the source provenance of an emitted rendering in a sidecar file beside it.
 *
 * @param {string} rendering The path of the rendering, a file or a directory.
 * @param {SourceProvenance} provenance The source provenance it was emitted from.
 *
 * @returns {Promise<void>} A promise that resolves once the sidecar is written.
 */
export const writeSourceProvenance = async (
  rendering: string,
  provenance: SourceProvenance,
): Promise<void> => {
  await fs.writeFile(provenanceFileFor(rendering), stringify(provenance), 'utf-8');
};

/**
 * Reads the source provenance recorded beside an emitted rendering.
 *
 * @param {string} rendering The path of the rendering, a file or a directory.
 *
 * @returns {Promise<null | SourceProvenance>}
 *   The provenance, or `null` when the rendering has no sidecar or its sidecar is not valid.
 */
export const readSourceProvenance = (rendering: string): Promise<null | SourceProvenance> =>
  readProvenance(provenanceFileFor(rendering), SourceProvenanceSchema);

/**
 * Records the provenance of a generated resume PDF in a sidecar file beside it: the source
 * provenance of the HTML it was printed from, the time it was printed, and its hash.
 *
 * @param {string} pdf The path of the generated PDF.
 * @param {Date} generatedAt The time the PDF was generated.
 * @param {SourceProvenance} source The source provenance of the HTML the PDF was printed from.
 *
 * @returns {Promise<ResumeProvenance>} The provenance that was recorded.
 */
export const writeResumeProvenance = async (
  pdf: string,
  generatedAt: Date,
  source: SourceProvenance,
): Promise<ResumeProvenance> => {
  const provenance = ResumeProvenanceSchema.parse({
    ...source,
    generatedAt: generatedAt.toISOString(),
    sha256: await sha256OfFile(pdf),
  });
  await fs.writeFile(provenanceFileFor(pdf), stringify(provenance), 'utf-8');
  return provenance;
};

/**
 * Reads the provenance recorded beside a generated resume PDF.
 *
 * @param {string} pdf The path of the generated PDF.
 *
 * @returns {Promise<null | ResumeProvenance>}
 *   The provenance, or `null` when the PDF has no sidecar or its sidecar is not valid.
 */
export const readResumeProvenance = (pdf: string): Promise<null | ResumeProvenance> =>
  readProvenance(provenanceFileFor(pdf), ResumeProvenanceSchema);
