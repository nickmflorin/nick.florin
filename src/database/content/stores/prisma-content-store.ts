import { type Transaction } from '~/database/prisma';

import {
  type ContentBinding,
  type ParsedRecord,
  type SluggedFieldCodecRecord,
} from '../bindings/content-binding';
import { type PrismaWriteContext } from '../codecs/prisma-codec';
import { type IssueCollector } from '../issues';

import { type ContentStore } from './content-store';

/**
 * The database adapter of the {@link ContentStore} port. Constructed over an open transaction so
 * that a caller transferring several entities commits everything or nothing, and over the write
 * context that supplies the audit user.
 */
export class PrismaContentStore implements ContentStore {
  private readonly context: PrismaWriteContext;
  private readonly tx: Transaction;

  constructor(tx: Transaction, context: PrismaWriteContext) {
    this.context = context;
    this.tx = tx;
  }

  public async read<TFields extends SluggedFieldCodecRecord>(
    binding: ContentBinding<TFields>,
    issues: IssueCollector,
  ): Promise<ParsedRecord<TFields>[]> {
    return binding.prisma.read(this.tx, issues);
  }

  public async write<TFields extends SluggedFieldCodecRecord>(
    binding: ContentBinding<TFields>,
    records: readonly ParsedRecord<TFields>[],
    issues: IssueCollector,
  ): Promise<void> {
    for (const record of records) {
      /* eslint-disable-next-line no-await-in-loop -- Records are written in order inside one
         interactive transaction, which does not support concurrent operations. */
      await binding.prisma.create(this.tx, record, this.context, issues);
    }
  }
}
