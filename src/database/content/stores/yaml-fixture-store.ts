import fs from 'node:fs/promises';
import path from 'node:path';

import { parse, stringify } from 'yaml';

import { isRecordType } from '~/lib/typeguards';

import {
  type ContentBinding,
  type ParsedRecord,
  type SluggedFieldCodecRecord,
} from '../bindings/content-binding';
import { type IssueCollector } from '../issues';

import { type ContentStore, type EntityWritePlan } from './content-store';

/**
 * The width fixture emission folds prose at, matching the repository's Prettier line length so a
 * formatting pass never disagrees with a freshly emitted file.
 */
const FixtureLineWidth = 100;

interface YamlFixtureStoreOptions {
  /**
   * A comment block written verbatim at the top of every emitted file, ending with a newline.
   * Empty by default.
   */
  readonly banner?: string;
}

/**
 * The fixture-directory adapter of the {@link ContentStore} port. Reads parse and validate every
 * record through the entity's binding; writes emit deterministically ordered YAML, so a pull that
 * changes one field diffs as one line.
 */
export class YamlFixtureStore implements ContentStore {
  private readonly banner: string;
  private readonly directory: string;

  constructor(directory: string, options?: YamlFixtureStoreOptions) {
    this.banner = options?.banner ?? '';
    this.directory = directory;
  }

  private parseRecord<TFields extends SluggedFieldCodecRecord>(
    binding: ContentBinding<TFields>,
    raw: unknown,
    file: string,
    index: number,
    issues: IssueCollector,
  ): ParsedRecord<TFields> {
    try {
      return binding.parse(raw, issues);
    } catch (error) {
      throw new Error(
        `The ${binding.key} record at index ${index} of '${file}' is invalid: ` +
          `${error instanceof Error ? error.message : String(error)}`,
        { cause: error },
      );
    }
  }

  private pathFor(binding: { readonly fixtureFile: string }): string {
    return path.join(this.directory, binding.fixtureFile);
  }

  public async read<TFields extends SluggedFieldCodecRecord>(
    binding: ContentBinding<TFields>,
    issues: IssueCollector,
  ): Promise<ParsedRecord<TFields>[]> {
    const file = this.pathFor(binding);
    const raw: unknown = parse(await fs.readFile(file, 'utf-8'));
    if (!isRecordType(raw)) {
      throw new TypeError(`The fixture file '${file}' is not a YAML mapping.`);
    }
    const payload = raw[binding.fixtureKey];
    if (binding.fixtureShape === 'single') {
      return [this.parseRecord(binding, payload, file, 0, issues)];
    }
    if (!Array.isArray(payload)) {
      throw new TypeError(
        `The fixture file '${file}' does not hold a list under its '${binding.fixtureKey}' key.`,
      );
    }
    return payload.map((item: unknown, index) =>
      this.parseRecord(binding, item, file, index, issues),
    );
  }

  /**
   * Every field, because a pull rewrites the file wholesale rather than updating rows in place.
   */
  public writableFields(): null {
    return null;
  }

  /**
   * Rewrites the entity's fixture file from the planned records. The plan's deletions need no
   * handling here: a record the source no longer describes is simply absent from the file this
   * rewrites.
   */
  public async write<TFields extends SluggedFieldCodecRecord>(
    binding: ContentBinding<TFields>,
    plan: EntityWritePlan<TFields>,
    _issues: IssueCollector,
  ): Promise<void> {
    const encoded = plan.records.map(({ record }) => binding.serialize(record));
    const first = encoded.at(0);
    if (binding.fixtureShape === 'single' && first === undefined) {
      throw new TypeError(
        `A '${binding.key}' fixture holds exactly one record, but none were provided.`,
      );
    }
    const payload = binding.fixtureShape === 'single' ? first : encoded;
    const document = stringify({ [binding.fixtureKey]: payload }, { lineWidth: FixtureLineWidth });
    await fs.writeFile(this.pathFor(binding), `${this.banner}${document}`, 'utf-8');
  }
}
