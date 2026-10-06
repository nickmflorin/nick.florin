import fs from 'node:fs/promises';
import path from 'node:path';

import { sha256OfFile } from '~/scripts/generate-resume/provenance';

import { type ApprovedResumeState } from './approved-resume';

/**
 * The directory, inside the operating system's temporary directory, that the approved resume is
 * staged in for upload, one subdirectory per application.
 *
 * The browser server uploads only files inside the workspace or the temporary directory, and the
 * approved resume lives in the private data directory, which is neither; staging it under the
 * temporary directory, readable by Nick's account alone, keeps it out of the working tree. Each
 * application keeps its own copy until it is submitted or discarded, because a page may read an
 * attached file only when the form is submitted.
 */
export const ResumeStagingDirectoryName = 'job-search-resume';

/**
 * Copies the approved resume, under its attachment name, into the application's staging directory,
 * and verifies that the copy is the file that was approved.
 *
 * @param {Extract<ApprovedResumeState, { status: 'approved' }>} resume
 *   The resume Nick approved: its file in the data directory, and its manifest.
 * @param {{ readonly id: string; readonly temporaryDirectory: string }} staging
 *   The job identifier of the posting applied to, and the operating system's temporary directory.
 *
 * @throws {Error} If the staged copy's hash differs from the approval's.
 *
 * @returns {Promise<string>} The staged file.
 */
export const stageApprovedResume = async (
  resume: Extract<ApprovedResumeState, { status: 'approved' }>,
  { id, temporaryDirectory }: { readonly id: string; readonly temporaryDirectory: string },
): Promise<string> => {
  const root = path.join(temporaryDirectory, ResumeStagingDirectoryName);
  await fs.mkdir(root, { mode: 0o700, recursive: true });
  const directory = path.join(root, id);
  await fs.mkdir(directory, { mode: 0o700, recursive: true });
  const file = path.join(directory, resume.manifest.fileName);
  await fs.copyFile(resume.file, file);
  if ((await sha256OfFile(file)) !== resume.manifest.sha256) {
    await fs.rm(directory, { force: true, recursive: true });
    throw new Error('The staged resume does not match the approved resume.');
  }
  return file;
};

/**
 * Removes an application's staged resume, with its staging subdirectory.
 *
 * @param {string} stagedFile The staged file, as {@link stageApprovedResume} returned it.
 *
 * @throws {Error} If the file does not lie in a staging subdirectory.
 *
 * @returns {Promise<void>} A promise that resolves once the staged copy is gone.
 */
export const unstageResume = async (stagedFile: string): Promise<void> => {
  const directory = path.dirname(stagedFile);
  if (path.basename(path.dirname(directory)) !== ResumeStagingDirectoryName) {
    throw new Error(`'${stagedFile}' is not a staged resume.`);
  }
  await fs.rm(directory, { force: true, recursive: true });
};
