import { Proficiency } from '~/database/model';
import { type Transaction } from '~/database/prisma';
import { slugify } from '~/lib/formatters/slugify';

import { omitBookkeeping } from '../bookkeeping';
import { PrismaCodec, type PrismaWriteContext } from '../codecs/prisma-codec';
import { type CanonicalRecord, RecordCodec } from '../codecs/record-codec';
import { type FieldCodecRecord } from '../fields/field-codec';
import {
  channelsField,
  flagField,
  nullableEnumField,
  nullableIntField,
  nullableStringField,
  slugField,
  stringField,
  visibilityField,
} from '../fields/primitives';

import { ContentBinding, type ParsedRecord } from './content-binding';

export const CompetencyFields = {
  calculatedExperience: nullableIntField(),
  description: nullableStringField(),
  excludedChannels: channelsField(),
  experience: nullableIntField(),
  isHighlighted: flagField(),
  isPrioritized: flagField(),
  isVisible: visibilityField(),
  label: stringField(),
  proficiency: nullableEnumField(Proficiency),
  shortDescription: nullableStringField(),
  shortLabel: nullableStringField(),
  slug: slugField(),
} satisfies FieldCodecRecord;

export type CanonicalCompetency = ParsedRecord<typeof CompetencyFields>;

class CompetencyPrismaCodec extends PrismaCodec<CanonicalCompetency> {
  public async create(
    tx: Transaction,
    record: CanonicalCompetency,
    context: PrismaWriteContext,
  ): Promise<void> {
    await tx.competency.create({
      data: {
        ...omitBookkeeping(record),
        createdById: context.userId,
        updatedById: context.userId,
      },
    });
  }

  public async read(tx: Transaction): Promise<CanonicalCompetency[]> {
    const rows = await tx.competency.findMany({ orderBy: { slug: 'asc' } });
    return rows.map(({ createdAt, id, updatedAt, ...row }) => ({
      ...omitBookkeeping(row),
      meta: { createdAt, id, updatedAt },
    }));
  }
}

export class CompetencyBinding extends ContentBinding<typeof CompetencyFields> {
  public readonly dependsOn: readonly string[] = [];
  public readonly fixtureFile = 'competencies.yaml';
  public readonly fixtureKey = 'competencies';
  public readonly fixtureShape = 'list';
  public readonly key = 'competency';
  public readonly prisma = new CompetencyPrismaCodec();
  public readonly record = new RecordCodec(CompetencyFields);

  protected override deriveSlug(record: CanonicalRecord<typeof CompetencyFields>): string {
    return slugify(record.label);
  }
}
