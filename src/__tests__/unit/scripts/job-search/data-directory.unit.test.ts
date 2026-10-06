import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { resolveDataDirectory } from '~/scripts/job-search/data-directory';

const execFileAsync = promisify(execFile);

let sandbox = '';

const initializeRepository = async (): Promise<string> => {
  const repository = path.join(sandbox, 'repository');
  await execFileAsync('git', ['init', '--quiet', repository]);
  return repository;
};

describe('resolveDataDirectory()', () => {
  beforeEach(async () => {
    sandbox = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'job-search-')));
  });

  afterEach(async () => {
    await fs.rm(sandbox, { force: true, recursive: true });
  });

  it.each([[''], ['   ']])('rejects the empty path %j', async configured => {
    expect.hasAssertions();
    await expect(resolveDataDirectory(configured)).rejects.toThrow('an empty path');
  });

  it.each([['$HOME/job-search'], ['~/job-search']])(
    'rejects %s, which the environment left unexpanded',
    async configured => {
      expect.hasAssertions();
      await expect(resolveDataDirectory(configured)).rejects.toThrow(
        'contains an unexpanded shell reference',
      );
    },
  );

  it('rejects a relative path', async () => {
    expect.hasAssertions();
    await expect(resolveDataDirectory('job-search/ai')).rejects.toThrow('is not an absolute path');
  });

  it('resolves an existing directory to its real path', async () => {
    expect.hasAssertions();
    await expect(resolveDataDirectory(`${sandbox}/`)).resolves.toBe(sandbox);
  });

  it('reports a missing directory without creating it', async () => {
    expect.hasAssertions();
    const target = path.join(sandbox, 'job-search', 'ai');
    await expect(resolveDataDirectory(target)).rejects.toThrow('does not exist');
    await expect(fs.stat(target)).rejects.toThrow('ENOENT');
  });

  it('creates a missing directory and its ancestors when creation is requested', async () => {
    expect.hasAssertions();
    const target = path.join(sandbox, 'job-search', 'ai');
    await expect(resolveDataDirectory(target, { create: true })).resolves.toBe(target);
    await expect(fs.stat(target)).resolves.toBeDefined();
  });

  it('rejects a path that is a file', async () => {
    expect.hasAssertions();
    const target = path.join(sandbox, 'preferences.yaml');
    await fs.writeFile(target, '');
    await expect(resolveDataDirectory(target)).rejects.toThrow('is not a directory');
  });

  it('refuses a directory inside a git repository', async () => {
    expect.hasAssertions();
    const target = path.join(await initializeRepository(), 'job-search');
    await fs.mkdir(target);
    await expect(resolveDataDirectory(target)).rejects.toThrow('lies inside a git repository');
  });

  it('refuses to create a directory inside a git repository', async () => {
    expect.hasAssertions();
    const target = path.join(await initializeRepository(), 'job-search', 'ai');
    await expect(resolveDataDirectory(target, { create: true })).rejects.toThrow(
      'lies inside a git repository',
    );
    await expect(fs.stat(target)).rejects.toThrow('ENOENT');
  });

  it('refuses a directory inside the .git directory of a repository', async () => {
    expect.hasAssertions();
    const target = path.join(await initializeRepository(), '.git', 'job-search');
    await fs.mkdir(target);
    await expect(resolveDataDirectory(target)).rejects.toThrow('lies inside a git repository');
  });

  it('refuses a symbolic link that leads into a git repository', async () => {
    expect.hasAssertions();
    const target = path.join(await initializeRepository(), 'job-search');
    const link = path.join(sandbox, 'job-search-link');
    await fs.mkdir(target);
    await fs.symlink(target, link);
    await expect(resolveDataDirectory(link)).rejects.toThrow('lies inside a git repository');
  });
});
