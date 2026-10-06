import fs from 'node:fs/promises';
import path from 'node:path';

import { z } from 'zod';

import {
  readResumeProvenance,
  type ResumeProvenance,
  ResumeProvenanceSchema,
  resumeSourcesChangedSince,
  sha256OfFile,
} from '~/scripts/generate-resume/provenance';

import { listDirectory, pathExists, writeFileAtomically } from '../fs';
import { readYamlRecord, writeYamlRecord } from '../ledger/yaml-records';
import { TextSchema, TimestampSchema } from '../schemas';

/**
 * The directory, inside the job-search data directory, that holds the approved resume.
 */
export const ApprovedResumeDirectoryName = 'resume';

const ManifestFileName = 'manifest.yaml';

/**
 * The directory, inside the approved-resume directory, that keeps a copy of every resume ever
 * approved, named by its hash, so that the exact file an application attached can always be found
 * from the hash its ledger record holds.
 */
const ArchiveDirectoryName = 'archive';

const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);

/**
 * The record of the approved resume: which generated PDF was approved, when, under what file name
 * it is attached, its hash, and the provenance it was generated with — `null` when the PDF had no
 * provenance sidecar.
 */
export const ApprovedResumeManifestSchema = z
  .object({
    approvedAt: TimestampSchema,
    fileName: z.string().regex(/^[^/\\]+\.pdf$/),
    provenance: ResumeProvenanceSchema.nullable(),
    sha256: Sha256Schema,
    sourceFile: TextSchema,
  })
  .strict();

export type ApprovedResumeManifest = z.infer<typeof ApprovedResumeManifestSchema>;

/**
 * A resume PDF in the generation output directory, a candidate for approval.
 */
export interface GeneratedResume {
  readonly file: string;
  readonly modifiedAt: Date;
  readonly name: string;
  readonly provenance: null | ResumeProvenance;
}

export type ApprovedResumeState =
  | {
      readonly file: string;
      readonly manifest: ApprovedResumeManifest;
      readonly status: 'approved';
    }
  | { readonly manifest: ApprovedResumeManifest; readonly status: 'mismatched' }
  | { readonly status: 'missing' };

const approvedDirectoryIn = (dataDirectory: string): string =>
  path.join(dataDirectory, ApprovedResumeDirectoryName);

/**
 * Whether a generated resume may be a draft: it was generated from uncommitted resume sources, or
 * it has no provenance to say otherwise.
 */
export const isDraftResume = ({ provenance }: GeneratedResume): boolean =>
  provenance === null || provenance.uncommitted.length > 0;

/**
 * The file name the approved resume is attached under: the person's name rather than the
 * timestamped name it was generated under, which reads as a draft to whoever receives it.
 */
export const approvedResumeFileName = ({
  firstName,
  lastName,
}: {
  readonly firstName: string;
  readonly lastName: string;
}): string => `${firstName}-${lastName}-Resume.pdf`.replace(/[^A-Za-z0-9.-]+/gu, '-');

/**
 * Lists the resume PDFs in the generation output directory, most recently generated first, with
 * the provenance recorded beside each.
 *
 * @param {string} directory The generation output directory.
 *
 * @returns {Promise<GeneratedResume[]>} Every generated PDF, with its provenance.
 */
export const listGeneratedResumes = async (directory: string): Promise<GeneratedResume[]> => {
  const resumes = await Promise.all(
    (await listDirectory(directory))
      .filter(name => name.endsWith('.pdf'))
      .map(async name => {
        const file = path.join(directory, name);
        const [{ mtime }, provenance] = await Promise.all([
          fs.stat(file),
          readResumeProvenance(file),
        ]);
        return { file, modifiedAt: mtime, name, provenance };
      }),
  );
  return resumes.sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime());
};

/**
 * Approves a generated resume for every application from now on: copies it into the data
 * directory under its attachment name, archives it by hash, and records the approval.
 *
 * The manifest is written last, so that an approval interrupted part-way leaves the previous
 * manifest describing a file whose hash no longer matches — which {@link readApprovedResume}
 * reports as a mismatch, blocking applications, rather than as a valid approval.
 *
 * @param {object} approval
 *   The data directory, the generated resume, the file name to attach it under, and the time.
 *
 * @throws {Error} If the PDF no longer matches the hash its provenance recorded at generation.
 *
 * @returns {Promise<ApprovedResumeManifest>} The recorded approval.
 */
export const approveResume = async ({
  dataDirectory,
  fileName,
  now,
  resume,
}: {
  readonly dataDirectory: string;
  readonly fileName: string;
  readonly now: Date;
  readonly resume: GeneratedResume;
}): Promise<ApprovedResumeManifest> => {
  const contents = await fs.readFile(resume.file);
  const sha256 = await sha256OfFile(resume.file);
  if (resume.provenance !== null && resume.provenance.sha256 !== sha256) {
    throw new Error(
      `'${resume.name}' has changed since it was generated, so its provenance no longer ` +
        'describes it. Regenerate the resume and approve the new PDF.',
    );
  }
  const directory = approvedDirectoryIn(dataDirectory);
  await writeFileAtomically(path.join(directory, ArchiveDirectoryName, `${sha256}.pdf`), contents);
  await writeFileAtomically(path.join(directory, fileName), contents);
  const manifest: ApprovedResumeManifest = {
    approvedAt: now.toISOString(),
    fileName,
    provenance: resume.provenance,
    sha256,
    sourceFile: resume.name,
  };
  await writeYamlRecord(
    path.join(directory, ManifestFileName),
    manifest,
    ApprovedResumeManifestSchema,
  );
  return manifest;
};

/**
 * Reads the approved resume, verifying that the file on disk is the one that was approved.
 *
 * @param {string} dataDirectory The job-search data directory.
 *
 * @returns {Promise<ApprovedResumeState>}
 *   `approved` with the file to attach; `mismatched` when the file is missing or its hash differs
 *   from the approval, which blocks every application until a resume is approved again; or
 *   `missing` when no resume has been approved.
 */
export const readApprovedResume = async (dataDirectory: string): Promise<ApprovedResumeState> => {
  const directory = approvedDirectoryIn(dataDirectory);
  const manifest = await readYamlRecord(
    path.join(directory, ManifestFileName),
    ApprovedResumeManifestSchema,
  );
  if (manifest === null) {
    return { status: 'missing' };
  }
  const file = path.join(directory, manifest.fileName);
  return (await pathExists(file)) && (await sha256OfFile(file)) === manifest.sha256
    ? { file, manifest, status: 'approved' }
    : { manifest, status: 'mismatched' };
};

export type ApprovedResumeSummary =
  | {
      readonly approvedAt: string;
      /**
       * The resume source files changed since the approved resume was generated — information
       * only: the approved resume is what is sent until Nick approves another. `null` when the
       * approval carries no provenance to compare against.
       */
      readonly changedSince: null | string[];
      readonly fileName: string;
      readonly sourceFile: string;
      readonly status: 'approved';
    }
  | { readonly status: 'mismatched' | 'missing' };

/**
 * Summarizes the approved resume for the start of a run: which one is sent, since when, and which
 * resume sources have changed since it was generated.
 *
 * @param {string} dataDirectory The job-search data directory.
 * @param {string} repository The root of the repository holding the resume sources.
 *
 * @returns {Promise<ApprovedResumeSummary>} The summary, or why there is no approved resume.
 */
export const summarizeApprovedResume = async (
  dataDirectory: string,
  repository: string,
): Promise<ApprovedResumeSummary> => {
  const resume = await readApprovedResume(dataDirectory);
  if (resume.status !== 'approved') {
    return { status: resume.status };
  }
  const { approvedAt, fileName, provenance, sourceFile } = resume.manifest;
  return {
    approvedAt,
    changedSince:
      provenance === null
        ? null
        : await resumeSourcesChangedSince(repository, provenance.commit).catch(() => null),
    fileName,
    sourceFile,
    status: 'approved',
  };
};
