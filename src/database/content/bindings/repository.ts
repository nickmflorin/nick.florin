import { type Transaction } from '~/database/prisma';

import { omitBookkeeping } from '../bookkeeping';
import { PrismaCodec, type PrismaWriteContext } from '../codecs/prisma-codec';
import { RecordCodec } from '../codecs/record-codec';
import { type FieldCodecRecord } from '../fields/field-codec';
import {
  channelsField,
  dateField,
  flagField,
  nullableStringField,
  slugRefListField,
  stringField,
  visibilityField,
} from '../fields/primitives';
import { type IssueCollector } from '../issues';

import { ContentBinding, type ParsedRecord } from './content-binding';

/**
 * `Repository` is a reused legacy model (carried over intact, decided 2026-08-11): the GitHub sync
 * integration owns its rows, so the push direction links against existing rows and writes only the
 * additive new-model membership — the `channels` allowlist and the competency associations. A
 * repository the sync has not created yet is created whole, since every column it needs is in the
 * fixture.
 *
 * The slug is the GitHub repository name and has no natural name to derive from, so it is required
 * in the fixture.
 */
export const RepositoryFields = {
  channels: channelsField(),
  competencies: slugRefListField('competency'),
  description: nullableStringField(),
  highlighted: flagField(),
  npmPackageName: nullableStringField(),
  slug: stringField(),
  startDate: dateField(),
  visible: visibilityField(),
} satisfies FieldCodecRecord;

export type CanonicalRepository = ParsedRecord<typeof RepositoryFields>;

class RepositoryPrismaCodec extends PrismaCodec<CanonicalRepository> {
  public async create(
    tx: Transaction,
    record: CanonicalRepository,
    context: PrismaWriteContext,
  ): Promise<void> {
    const membership = {
      channels: [...record.channels],
      competencies: { connect: record.competencies.map(slug => ({ slug })) },
    };
    const existing = await tx.repository.findUnique({ where: { slug: record.slug } });
    if (existing !== null) {
      await tx.repository.update({
        data: {
          ...membership,
          competencies: { set: record.competencies.map(slug => ({ slug })) },
          updatedById: context.userId,
        },
        where: { id: existing.id },
      });
      return;
    }
    await tx.repository.create({
      data: {
        ...omitBookkeeping(record, ['competencies']),
        ...membership,
        createdById: context.userId,
        updatedById: context.userId,
      },
    });
  }

  public async read(tx: Transaction, _issues: IssueCollector): Promise<CanonicalRepository[]> {
    const rows = await tx.repository.findMany({
      include: { competencies: { orderBy: { slug: 'asc' } } },
      orderBy: { slug: 'asc' },
    });
    return rows.map(row => {
      const { competencies, createdAt, id, updatedAt, ...repository } = row;
      return {
        ...omitBookkeeping(repository),
        competencies: competencies.map(competency => competency.slug),
        meta: { createdAt, id, updatedAt },
      };
    });
  }
}

export class RepositoryBinding extends ContentBinding<typeof RepositoryFields> {
  public readonly dependsOn: readonly string[] = ['competency'];
  public readonly fixtureFile = 'repositories.yaml';
  public readonly fixtureKey = 'repositories';
  public readonly fixtureShape = 'list';
  public readonly key = 'repository';
  public readonly prisma = new RepositoryPrismaCodec();
  public readonly record = new RecordCodec(RepositoryFields);
}
