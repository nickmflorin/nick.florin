import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

import { isError } from '../fs';

const RetryIntervalMs = 200;

/**
 * How long a caller waits for the lock before giving up. It comfortably exceeds the longest wait a
 * holder can impose, which is the maximum page-load delay.
 */
const AcquireTimeoutMs = 120 * 1000;

/**
 * The age past which a lock is presumed abandoned by a process that died holding it.
 */
const StaleLockMs = 10 * 60 * 1000;

const isAlreadyExistsError = (error: unknown): boolean =>
  isError(error) && 'code' in error && error.code === 'EEXIST';

/**
 * Derives the lock file for a data directory.
 *
 * The lock lives in the operating system's temporary directory rather than in the data directory,
 * because the data directory is synced by iCloud and a lock file is meaningful only on the machine
 * that holds it.
 *
 * @param {string} dataDirectory The job-search data directory.
 *
 * @returns {string} The path of the lock file.
 */
export const lockFileFor = (dataDirectory: string): string =>
  path.join(
    os.tmpdir(),
    `job-search-${createHash('sha256').update(dataDirectory).digest('hex').slice(0, 16)}.lock`,
  );

const removeIfStale = async (lockFile: string): Promise<void> => {
  try {
    const { mtimeMs } = await fs.stat(lockFile);
    if (Date.now() - mtimeMs > StaleLockMs) {
      await fs.rm(lockFile, { force: true });
    }
  } catch {
    /* The lock vanished between the failed acquisition and this check, which the next attempt
       will discover by acquiring it. */
  }
};

const acquire = async (lockFile: string, deadline: number): Promise<void> => {
  try {
    await fs.writeFile(lockFile, String(process.pid), { flag: 'wx' });
  } catch (error) {
    if (!isAlreadyExistsError(error)) {
      throw error;
    } else if (Date.now() > deadline) {
      throw new Error(
        `The job-search ledger lock '${lockFile}' could not be acquired: another job-search ` +
          'command is still running.',
        { cause: error },
      );
    }
    await removeIfStale(lockFile);
    await sleep(RetryIntervalMs);
    await acquire(lockFile, deadline);
  }
};

/**
 * Runs work while holding the exclusive lock on a data directory's ledger, so that commands that
 * read, decide on and rewrite the same records — the daily budget above all — run one at a time.
 *
 * @param {string} dataDirectory The job-search data directory.
 * @param {() => Promise<T>} work The work to run under the lock.
 *
 * @throws {Error} If the lock is not released by its holder within the acquisition timeout.
 *
 * @returns {Promise<T>} The result of the work.
 */
export const withLedgerLock = async <T>(
  dataDirectory: string,
  work: () => Promise<T>,
): Promise<T> => {
  const lockFile = lockFileFor(dataDirectory);
  await acquire(lockFile, Date.now() + AcquireTimeoutMs);
  try {
    return await work();
  } finally {
    await fs.rm(lockFile, { force: true });
  }
};
