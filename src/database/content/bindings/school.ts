import { pick } from 'lodash-es';

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
import { nullableStringField, slugField, stringField } from '../fields/primitives';
import { type IssueCollector } from '../issues';

import { ContentBinding, type ParsedRecord } from './content-binding';

/**
 * `School` is a reused legacy model; see the `Company` binding for the create-or-link semantics
 * of the push direction. Unlike `Company`, `city` and `state` are required in the fixture as
 * well, because every school on record carries them.
 */
export const SchoolFields = {
  city: stringField(),
  description: nullableStringField(),
  logoFileName: nullableStringField(),
  logoImageUrl: nullableStringField(),
  name: stringField(),
  shortName: nullableStringField(),
  slug: slugField(),
  state: stringField(),
  websiteUrl: nullableStringField(),
} satisfies FieldCodecRecord;

export type CanonicalSchool = ParsedRecord<typeof SchoolFields>;

class SchoolPrismaCodec extends PrismaCodec<CanonicalSchool> {
  public override readonly writableFields = ['logoFileName', 'slug'];

  public async read(tx: Transaction, issues: IssueCollector): Promise<CanonicalSchool[]> {
    const rows = await tx.school.findMany({ orderBy: { name: 'asc' } });
    return rows.map(row => {
      if (row.slug === null) {
        issues.warning(
          'school',
          row.name,
          'The school has no slug yet; one was derived from its name for the fixture. The next ' +
            'push will persist it.',
        );
      }
      const { createdAt, id, updatedAt, ...school } = row;
      return {
        ...omitBookkeeping(school),
        meta: { createdAt, id, updatedAt },
        slug: school.slug ?? slugify(school.name),
      };
    });
  }

  public async write(
    tx: Transaction,
    plan: RecordWritePlan<CanonicalSchool>,
    context: PrismaWriteContext,
  ): Promise<void> {
    const { existing, record } = plan;
    if (existing !== null) {
      await tx.school.update({
        data: {
          ...pick(record, ['logoFileName', 'slug']),
          updatedById: context.userId,
        },
        where: { id: targetId('school', existing) },
      });
      return;
    }
    await tx.school.create({
      data: {
        ...omitBookkeeping(record),
        createdById: context.userId,
        updatedById: context.userId,
      },
    });
  }
}

export class SchoolBinding extends ContentBinding<typeof SchoolFields> {
  public readonly dependsOn: readonly string[] = [];
  public readonly fixtureFile = 'schools.yaml';
  public readonly fixtureKey = 'schools';
  public readonly fixtureShape = 'list';
  public readonly key = 'school';
  public readonly prisma = new SchoolPrismaCodec();
  public readonly record = new RecordCodec(SchoolFields);

  protected override deriveSlug(record: CanonicalRecord<typeof SchoolFields>): string {
    return slugify(record.name);
  }

  public override alternateKeys(record: CanonicalSchool): readonly string[] {
    return [record.name];
  }
}
