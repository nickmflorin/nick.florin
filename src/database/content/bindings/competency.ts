import { Proficiency } from '~/database/model';
import { type Transaction } from '~/database/prisma';
import { slugify } from '~/lib/formatters/slugify';

import { omitBookkeeping } from '../bookkeeping';
import {
  PrismaCodec,
  type PrismaWriteContext,
  type RecordWritePlan,
  targetId,
} from '../codecs/prisma-codec';
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
import { type IssueCollector } from '../issues';

import { ContentBinding, type ParsedRecord } from './content-binding';

export const CompetencyFields = {
  calculatedExperience: nullableIntField(),
  channels: channelsField(),
  description: nullableStringField(),
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
  public override readonly deletionPolicy = 'delete';

  public async delete(tx: Transaction, record: CanonicalCompetency): Promise<void> {
    await tx.competency.delete({ where: { id: targetId('competency', record) } });
  }

  public async read(tx: Transaction): Promise<CanonicalCompetency[]> {
    const rows = await tx.competency.findMany({ orderBy: { slug: 'asc' } });
    return rows.map(({ createdAt, id, updatedAt, ...row }) => ({
      ...omitBookkeeping(row),
      meta: { createdAt, id, updatedAt },
    }));
  }

  public async write(
    tx: Transaction,
    plan: RecordWritePlan<CanonicalCompetency>,
    context: PrismaWriteContext,
    issues: IssueCollector,
  ): Promise<void> {
    const { existing, record } = plan;
    if (existing !== null) {
      await tx.competency.update({
        data: { ...omitBookkeeping(record), updatedById: context.userId },
        where: { id: targetId('competency', existing) },
      });
      return;
    }
    await tx.competency.create({
      data: {
        ...omitBookkeeping(record),
        createdAt: context.inheritedCreatedAt(
          { entity: 'competency', label: record.label, slug: record.slug },
          issues,
        ),
        createdById: context.userId,
        updatedById: context.userId,
      },
    });
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
