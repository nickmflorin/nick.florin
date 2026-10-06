import path from 'node:path';

import { chunk } from 'lodash-es';
import { parse, stringify } from 'yaml';
import { type z } from 'zod';

import { listDirectory, readTextFile, writeFileAtomically } from '../fs';

import { type LedgerListing, type SkippedLedgerFileReason } from './ledger-store';

const LedgerLineWidth = 100;

/**
 * How many record files a listing reads at once.
 *
 * Every posting ever seen keeps a file, so a listing can cover thousands of them. Reading them all
 * at once would exceed the open-file limit macOS imposes on a process by default, so they are read
 * in batches of this size, one batch after another.
 */
const ListReadBatchSize = 64;

const YamlExtension = '.yaml';

const ICloudPlaceholderSuffix = '.icloud';

/**
 * The name iCloud gives the second version of a file when two writes to it collide: the original
 * name with a space and a number before the extension, as in `4012345678 2.yaml`.
 */
const ConflictCopy = /^(.+) \d+\.yaml$/u;

/**
 * A schema whose output is a ledger record of type `T`, whatever its input type.
 */
export type LedgerRecordSchema<T> = z.ZodType<T, z.ZodTypeDef, unknown>;

/**
 * The error raised when a ledger file cannot be read as the record it is expected to hold.
 */
export class LedgerFileError extends Error {}

const parseYaml = (text: string, file: string): unknown => {
  try {
    return parse(text);
  } catch (error) {
    throw new LedgerFileError(`The ledger file '${file}' is not valid YAML.`, { cause: error });
  }
};

const validate = <T>(value: unknown, schema: LedgerRecordSchema<T>, file: string): T => {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new LedgerFileError(`The ledger file '${file}' is invalid: ${parsed.error.message}`);
  }
  return parsed.data;
};

/**
 * Reads a ledger file and validates it against its schema.
 *
 * @param {string} file The path of the file.
 * @param {LedgerRecordSchema<T>} schema The schema the file's contents must satisfy.
 *
 * @throws {LedgerFileError} If the file is not valid YAML or does not satisfy the schema.
 *
 * @returns {Promise<null | T>} The record, or `null` when the file does not exist.
 */
export const readYamlRecord = async <T>(
  file: string,
  schema: LedgerRecordSchema<T>,
): Promise<null | T> => {
  const text = await readTextFile(file);
  return text === null ? null : validate(parseYaml(text, file), schema, file);
};

/**
 * Validates a record against its schema and writes it to a ledger file, atomically.
 *
 * Validating on write as well as on read means an invalid record is rejected where it was produced,
 * rather than discovered by whichever later run next reads the file.
 *
 * @param {string} file The path of the file.
 * @param {T} record The record to write.
 * @param {LedgerRecordSchema<T>} schema The schema the record must satisfy.
 *
 * @throws {LedgerFileError} If the record does not satisfy the schema.
 *
 * @returns {Promise<void>} A promise that resolves once the file is in place.
 */
export const writeYamlRecord = async <T>(
  file: string,
  record: T,
  schema: LedgerRecordSchema<T>,
): Promise<void> => {
  await writeFileAtomically(
    file,
    stringify(validate(record, schema, file), { lineWidth: LedgerLineWidth }),
  );
};

export interface YamlRecordDirectoryOptions<T> {
  /**
   * The directory holding one file per record, each named for its record's key.
   */
  readonly directory: string;
  readonly keyOf: (record: T) => string;
  /**
   * The pattern a record key must match. Keys name files, so a key outside the pattern is refused
   * rather than allowed to address a path outside the directory.
   */
  readonly keyPattern: RegExp;
  readonly schema: LedgerRecordSchema<T>;
}

/**
 * A directory of YAML files holding one ledger record each, named `{key}.yaml` for the key of the
 * record it holds.
 *
 * Listing tolerates what iCloud leaves in a synced directory: evicted-file placeholders and
 * conflict copies are reported as skipped rather than parsed, and hidden files — including the
 * temporary files of an in-flight atomic write — are ignored.
 */
export class YamlRecordDirectory<T> {
  private readonly options: YamlRecordDirectoryOptions<T>;

  constructor(options: YamlRecordDirectoryOptions<T>) {
    this.options = options;
  }

  private fileFor(key: string): string {
    if (!this.options.keyPattern.test(key)) {
      throw new TypeError(`The ledger key '${key}' is not of the form the directory expects.`);
    }
    return path.join(this.options.directory, `${key}${YamlExtension}`);
  }

  private isConflictCopy(file: string): boolean {
    const original = ConflictCopy.exec(file)?.[1];
    return original !== undefined && this.options.keyPattern.test(original);
  }

  private keyOfFile(file: string): null | string {
    const stem = file.endsWith(YamlExtension) ? file.slice(0, -YamlExtension.length) : null;
    return stem !== null && this.options.keyPattern.test(stem) ? stem : null;
  }

  private async readKeyed(key: string): Promise<null | T> {
    const file = this.fileFor(key);
    const record = await readYamlRecord(file, this.options.schema);
    if (record !== null && this.options.keyOf(record) !== key) {
      throw new LedgerFileError(
        `The ledger file '${file}' holds the record '${this.options.keyOf(record)}'.`,
      );
    }
    return record;
  }

  private skipReasonOf(file: string): null | SkippedLedgerFileReason {
    if (file.endsWith(ICloudPlaceholderSuffix)) {
      return 'not-downloaded';
    } else if (file.startsWith('.') || this.keyOfFile(file) !== null) {
      return null;
    } else if (this.isConflictCopy(file)) {
      return 'conflict-copy';
    }
    return 'unrecognized';
  }

  /**
   * Reads the record with the given key, verifying that the file holds the record it is named for.
   *
   * @param {string} key The key the record's file is named for.
   *
   * @throws {LedgerFileError}
   *   If the file is not valid YAML, does not satisfy the schema, or holds a record with another
   *   key.
   *
   * @returns {Promise<null | T>} The record, or `null` when there is no file for the key.
   */
  public get(key: string): Promise<null | T> {
    return this.readKeyed(key);
  }

  public async list(): Promise<LedgerListing<T>> {
    const files = await listDirectory(this.options.directory);
    const keys = files.flatMap(file => {
      const key = this.keyOfFile(file);
      return key === null ? [] : [key];
    });
    const records = await chunk(keys, ListReadBatchSize).reduce<Promise<(null | T)[]>>(
      async (read, batch) => [
        ...(await read),
        ...(await Promise.all(batch.map(key => this.readKeyed(key)))),
      ],
      Promise.resolve([]),
    );
    return {
      records: records.flatMap(record => (record === null ? [] : [record])),
      skipped: files.flatMap(file => {
        const reason = this.skipReasonOf(file);
        return reason === null ? [] : [{ file, reason }];
      }),
    };
  }

  public async put(record: T): Promise<void> {
    await writeYamlRecord(this.fileFor(this.options.keyOf(record)), record, this.options.schema);
  }
}
