import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import { isError, pathExists } from './fs';

const execFileAsync = promisify(execFile);

/**
 * The flags with which `git rev-parse` reports whether a directory sits inside a work tree, and
 * whether it sits inside a `.git` directory — which a work-tree probe alone reports as `false`.
 */
const GitLocationProbe = ['rev-parse', '--is-inside-work-tree', '--is-inside-git-dir'];

/**
 * Clears the environment variables that point git at a repository other than the one around the
 * directory it is asked about.
 *
 * A git hook exports them, so they are unset in the probe's environment for the answer to describe
 * the directory itself. Node leaves a variable whose value is `undefined` out of a child process's
 * environment entirely.
 */
const WithoutRepositoryRedirection = { GIT_DIR: undefined, GIT_WORK_TREE: undefined };

/**
 * The error raised when the configured job-search data directory cannot be used.
 */
export class DataDirectoryError extends Error {}

export interface DataDirectoryOptions {
  /**
   * Whether a directory that does not exist yet is created, rather than reported as missing. Only
   * the interactive setup passes it, after the location has been confirmed, so that a mistyped path
   * is reported instead of silently becoming a new directory.
   *
   * @default false
   */
  readonly create?: boolean;
}

const isNotARepositoryError = (error: unknown): boolean =>
  isError(error) &&
  'stderr' in error &&
  typeof error.stderr === 'string' &&
  error.stderr.includes('not a git repository');

const nearestExistingAncestor = async (target: string): Promise<string> =>
  (await pathExists(target)) || path.dirname(target) === target
    ? target
    : nearestExistingAncestor(path.dirname(target));

/**
 * Validates the configured value as an absolute path that the shell environment has fully expanded.
 *
 * A leftover `$` or `~` means a reference such as `${HOME}` reached the process unexpanded.
 * Resolving it literally would place the directory somewhere unintended, so it is rejected.
 */
const toAbsolutePath = (configured: string): string => {
  const trimmed = configured.trim();
  if (trimmed === '') {
    throw new DataDirectoryError('The job-search data directory is configured as an empty path.');
  } else if (trimmed.includes('$') || trimmed.startsWith('~')) {
    throw new DataDirectoryError(
      `The job-search data directory '${trimmed}' contains an unexpanded shell reference. ` +
        'Configure it as an absolute path, or with a variable reference the environment expands.',
    );
  } else if (!path.isAbsolute(trimmed)) {
    throw new DataDirectoryError(
      `The job-search data directory '${trimmed}' is not an absolute path.`,
    );
  }
  return path.resolve(trimmed);
};

/**
 * Asks git whether a directory lies inside any repository, whether as part of a work tree or inside
 * a `.git` directory.
 *
 * Git is asked rather than the path being compared against the current repository's root, because a
 * comparison misses other checkouts and worktrees, and is defeated by symbolic links and by the
 * case-insensitive file system. Any failure other than git reporting that there is no repository is
 * raised, so that the guard fails closed.
 */
const isInsideGitRepository = async (directory: string): Promise<boolean> => {
  try {
    const { stdout } = await execFileAsync('git', ['-C', directory, ...GitLocationProbe], {
      env: { ...process.env, ...WithoutRepositoryRedirection },
    });
    return stdout.split('\n').some(line => line.trim() === 'true');
  } catch (error) {
    if (isNotARepositoryError(error)) {
      return false;
    }
    throw new DataDirectoryError(
      `Git could not be run to confirm that '${directory}' lies outside every repository.`,
      { cause: error },
    );
  }
};

/**
 * Resolves the configured job-search data directory to the real, absolute path of a directory that
 * lies outside every git repository.
 *
 * The directory holds personal data — preferences, application answers and the application ledger —
 * and this repository is public. The guard therefore refuses any location inside a repository,
 * including a gitignored one, since a single mistaken ignore rule would publish it. A location that
 * does not exist yet is checked through its nearest existing ancestor, before anything is created.
 *
 * @param {string} configured The configured location, as it reached the process environment.
 * @param {DataDirectoryOptions} options Whether a missing directory is created.
 *
 * @throws {DataDirectoryError}
 *   If the location is not an absolute path, is not a directory, lies inside a git repository, or
 *   does not exist and creation was not requested.
 *
 * @returns {Promise<string>} The real path of the data directory.
 */
export const resolveDataDirectory = async (
  configured: string,
  options: DataDirectoryOptions = {},
): Promise<string> => {
  const target = toAbsolutePath(configured);
  const exists = await pathExists(target);
  if (exists && !(await fs.stat(target)).isDirectory()) {
    throw new DataDirectoryError(`The job-search data directory '${target}' is not a directory.`);
  } else if (!exists && options.create !== true) {
    throw new DataDirectoryError(
      `The job-search data directory '${target}' does not exist. It is created by the job-search ` +
        'setup once its location has been confirmed.',
    );
  }
  if (await isInsideGitRepository(await fs.realpath(await nearestExistingAncestor(target)))) {
    throw new DataDirectoryError(
      `The job-search data directory '${target}' lies inside a git repository. It holds personal ` +
        'data, so it must live outside every repository, where no ignore rule is relied on.',
    );
  }
  if (!exists) {
    await fs.mkdir(target, { recursive: true });
  }
  return fs.realpath(target);
};
