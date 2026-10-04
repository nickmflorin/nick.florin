import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import {
  captureSourceProvenance,
  readResumeProvenance,
  readSourceProvenance,
  writeResumeProvenance,
  writeSourceProvenance,
} from '~/scripts/generate-resume/provenance';

const execFileAsync = promisify(execFile);

let repository = '';

/**
 * Runs git in the sandbox repository, with an identity supplied inline so that committing does not
 * depend on the configuration of the machine running the suite.
 */
const git = async (...args: string[]): Promise<string> =>
  (
    await execFileAsync(
      'git',
      ['-c', 'user.email=suite@example.com', '-c', 'user.name=Suite', ...args],
      { cwd: repository },
    )
  ).stdout.trim();

const write = async (relative: string, contents: string): Promise<void> => {
  await fs.mkdir(path.dirname(path.join(repository, relative)), { recursive: true });
  await fs.writeFile(path.join(repository, relative), contents);
};

describe('resume provenance', () => {
  beforeEach(async () => {
    repository = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'resume-provenance-')));
    await git('init', '--quiet');
    await write('src/documents/resume/fixtures/roles.yaml', 'roles: []\n');
    await write('README.md', 'Readme\n');
    await git('add', '--all');
    await git('commit', '--quiet', '--message', 'Initial');
  });

  afterEach(async () => {
    await fs.rm(repository, { force: true, recursive: true });
  });

  describe('captureSourceProvenance()', () => {
    it('reports a clean tree at its commit', async () => {
      expect.hasAssertions();
      await expect(captureSourceProvenance(repository)).resolves.toStrictEqual({
        commit: await git('rev-parse', 'HEAD'),
        uncommitted: [],
      });
    });

    it('lists modified and untracked resume sources, including paths with spaces', async () => {
      expect.hasAssertions();
      await write('src/documents/resume/fixtures/roles.yaml', 'roles: [edited]\n');
      await write('src/styles/document/new sheet.scss', '');
      const { uncommitted } = await captureSourceProvenance(repository);
      expect(uncommitted.toSorted()).toStrictEqual([
        'src/documents/resume/fixtures/roles.yaml',
        'src/styles/document/new sheet.scss',
      ]);
    });

    it('ignores changes outside the resume sources', async () => {
      expect.hasAssertions();
      await write('README.md', 'Edited\n');
      await write('src/app/page.tsx', '');
      await expect(captureSourceProvenance(repository)).resolves.toMatchObject({
        uncommitted: [],
      });
    });

    it('reports a renamed source by the path it now has', async () => {
      expect.hasAssertions();
      await git(
        'mv',
        'src/documents/resume/fixtures/roles.yaml',
        'src/documents/resume/fixtures/positions.yaml',
      );
      await expect(captureSourceProvenance(repository)).resolves.toMatchObject({
        uncommitted: ['src/documents/resume/fixtures/positions.yaml'],
      });
    });
  });

  describe('writeResumeProvenance()', () => {
    it("carries the HTML's source provenance into the PDF's, with the PDF's hash", async () => {
      expect.hasAssertions();
      const html = path.join(repository, 'html');
      const pdf = path.join(repository, 'Resume.pdf');
      const source = await captureSourceProvenance(repository);
      await writeSourceProvenance(html, source);
      await fs.writeFile(pdf, '%PDF placeholder');
      const recorded = await readSourceProvenance(html);
      expect(recorded).toStrictEqual(source);
      const written = await writeResumeProvenance(
        pdf,
        new Date('2026-10-03T12:00:00.000Z'),
        source,
      );
      await expect(readResumeProvenance(pdf)).resolves.toStrictEqual(written);
      expect(written.sha256).toMatch(/^[a-f0-9]{64}$/u);
    });

    it('reads no provenance for a rendering without a sidecar', async () => {
      expect.hasAssertions();
      await expect(readSourceProvenance(path.join(repository, 'html'))).resolves.toBeNull();
    });
  });
});
