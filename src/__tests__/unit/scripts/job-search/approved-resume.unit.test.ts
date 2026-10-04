import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { stringify } from 'yaml';

import { assertDefined } from '~/lib/typeguards';
import { provenanceFileFor } from '~/scripts/generate-resume/provenance';
import {
  approvedResumeFileName,
  approveResume,
  isDraftResume,
  listGeneratedResumes,
  readApprovedResume,
} from '~/scripts/job-search/resume/approved-resume';

let sandbox = '';

const buildDirectory = (): string => path.join(sandbox, 'build');

const dataDirectory = (): string => path.join(sandbox, 'data');

const Commit = 'a'.repeat(40);

const sha256 = (contents: string): string => createHash('sha256').update(contents).digest('hex');

/**
 * Writes a placeholder PDF into the build directory, with a provenance sidecar unless it is told
 * not to, and with its modification time set so that listings can be ordered.
 */
const generate = async (
  name: string,
  { modifiedAt, uncommitted }: { readonly modifiedAt: Date; readonly uncommitted: null | string[] },
): Promise<void> => {
  const file = path.join(buildDirectory(), name);
  await fs.writeFile(file, `%PDF placeholder ${name}`);
  if (uncommitted !== null) {
    await fs.writeFile(
      provenanceFileFor(file),
      stringify({
        commit: Commit,
        generatedAt: modifiedAt.toISOString(),
        sha256: sha256(`%PDF placeholder ${name}`),
        uncommitted,
      }),
    );
  }
  await fs.utimes(file, modifiedAt, modifiedAt);
};

describe('approved resume', () => {
  beforeEach(async () => {
    sandbox = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'job-search-resume-')));
    await fs.mkdir(buildDirectory());
    await generate('Resume-Oct-01-2026-9:00am.pdf', {
      modifiedAt: new Date('2026-10-01T09:00:00.000Z'),
      uncommitted: [],
    });
    await generate('Resume-Oct-02-2026-9:00am.pdf', {
      modifiedAt: new Date('2026-10-02T09:00:00.000Z'),
      uncommitted: ['src/documents/resume/fixtures/roles.yaml'],
    });
    await generate('Resume-Aug-10-2026-7:28pm.pdf', {
      modifiedAt: new Date('2026-08-10T19:28:00.000Z'),
      uncommitted: null,
    });
  });

  afterEach(async () => {
    await fs.rm(sandbox, { force: true, recursive: true });
  });

  it('lists the generated resumes newest first, marking drafts', async () => {
    expect.hasAssertions();
    const resumes = await listGeneratedResumes(buildDirectory());
    expect(resumes.map(resume => [resume.name, isDraftResume(resume)])).toStrictEqual([
      ['Resume-Oct-02-2026-9:00am.pdf', true],
      ['Resume-Oct-01-2026-9:00am.pdf', false],
      ['Resume-Aug-10-2026-7:28pm.pdf', true],
    ]);
  });

  it('approves a resume, after which it reads back as approved', async () => {
    expect.hasAssertions();
    const resume = (await listGeneratedResumes(buildDirectory())).find(
      ({ name }) => name === 'Resume-Oct-01-2026-9:00am.pdf',
    );
    assertDefined(resume);
    const manifest = await approveResume({
      dataDirectory: dataDirectory(),
      fileName: 'Jane-Doe-Resume.pdf',
      now: new Date('2026-10-03T12:00:00.000Z'),
      resume,
    });
    expect(manifest).toMatchObject({
      fileName: 'Jane-Doe-Resume.pdf',
      sha256: sha256('%PDF placeholder Resume-Oct-01-2026-9:00am.pdf'),
      sourceFile: 'Resume-Oct-01-2026-9:00am.pdf',
    });
    await expect(readApprovedResume(dataDirectory())).resolves.toStrictEqual({
      file: path.join(dataDirectory(), 'resume', 'Jane-Doe-Resume.pdf'),
      manifest,
      status: 'approved',
    });
  });

  it('reports a mismatch when the approved file no longer matches its approval', async () => {
    expect.hasAssertions();
    const [resume] = await listGeneratedResumes(buildDirectory());
    await approveResume({
      dataDirectory: dataDirectory(),
      fileName: 'Jane-Doe-Resume.pdf',
      now: new Date('2026-10-03T12:00:00.000Z'),
      resume,
    });
    await fs.writeFile(path.join(dataDirectory(), 'resume', 'Jane-Doe-Resume.pdf'), 'edited');
    await expect(readApprovedResume(dataDirectory())).resolves.toMatchObject({
      status: 'mismatched',
    });
  });

  it('refuses a PDF that changed after its provenance was recorded', async () => {
    expect.hasAssertions();
    const [resume] = await listGeneratedResumes(buildDirectory());
    await fs.writeFile(resume.file, 'regenerated in place');
    await expect(
      approveResume({
        dataDirectory: dataDirectory(),
        fileName: 'Jane-Doe-Resume.pdf',
        now: new Date('2026-10-03T12:00:00.000Z'),
        resume,
      }),
    ).rejects.toThrow('has changed since it was generated');
  });

  it('reports no approval before one is made', async () => {
    expect.hasAssertions();
    await expect(readApprovedResume(dataDirectory())).resolves.toStrictEqual({ status: 'missing' });
  });

  it('names the approved file after the person, safely', () => {
    expect(approvedResumeFileName({ firstName: 'Jane', lastName: "O'Doe Smith" })).toBe(
      'Jane-O-Doe-Smith-Resume.pdf',
    );
  });
});
