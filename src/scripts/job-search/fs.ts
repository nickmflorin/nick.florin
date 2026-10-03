import fs from 'node:fs/promises';
import path from 'node:path';
import { types } from 'node:util';

/**
 * Whether a caught value is an error object, whichever realm created it.
 *
 * An `instanceof Error` check is not used because errors from Node's own modules are created in a
 * different realm from code that runs inside a sandbox such as Jest's, where they fail it.
 */
export const isError = (error: unknown): error is Error => types.isNativeError(error);

export const isMissingPathError = (error: unknown): boolean =>
  isError(error) && 'code' in error && error.code === 'ENOENT';

export const pathExists = async (candidate: string): Promise<boolean> => {
  try {
    await fs.stat(candidate);
    return true;
  } catch (error) {
    if (isMissingPathError(error)) {
      return false;
    }
    throw error;
  }
};

export const readTextFile = async (file: string): Promise<null | string> => {
  try {
    return await fs.readFile(file, 'utf-8');
  } catch (error) {
    if (isMissingPathError(error)) {
      return null;
    }
    throw error;
  }
};

/**
 * Lists the entries of a directory, treating a directory that does not exist yet as empty.
 */
export const listDirectory = async (directory: string): Promise<string[]> => {
  try {
    return await fs.readdir(directory);
  } catch (error) {
    if (isMissingPathError(error)) {
      return [];
    }
    throw error;
  }
};

/**
 * Writes a file by writing a hidden temporary file beside it and renaming it into place.
 *
 * The data directory is synced by iCloud, which can upload a file mid-write. A rename within one
 * directory is atomic, so the synced file is only ever the previous version or the complete new
 * one. The temporary file's leading dot keeps it out of directory listings that read records.
 */
export const writeFileAtomically = async (file: string, contents: string): Promise<void> => {
  const temporary = path.join(path.dirname(file), `.${path.basename(file)}.${process.pid}.tmp`);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(temporary, contents, 'utf-8');
  await fs.rename(temporary, file);
};
