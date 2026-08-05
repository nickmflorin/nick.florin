import { pick } from 'lodash-es';

import { type Transaction } from '~/database/prisma';
import { slugify } from '~/lib/formatters/slugify';

import { omitBookkeeping } from '../bookkeeping';
import { PrismaCodec, type PrismaWriteContext } from '../codecs/prisma-codec';
import { type CanonicalRecord, RecordCodec } from '../codecs/record-codec';
import { type FieldCodecRecord } from '../fields/field-codec';
import { nullableStringField, slugField, stringField } from '../fields/primitives';
import { type IssueCollector } from '../issues';

import { ContentBinding, type ParsedRecord } from './content-binding';

/**
 * `Company` is a reused legacy model, so its fixture carries no syndication fields, and the push
 * direction links against existing rows rather than assuming an empty table: an existing company
 * (matched by slug, then by its unique name) only has the additive columns written, while a
 * genuinely new company is created — which requires the legacy-required `city`/`state`.
 */
export const CompanyFields = {
  city: nullableStringField(),
  description: nullableStringField(),
  logoFileName: nullableStringField(),
  logoImageUrl: nullableStringField(),
  name: stringField(),
  shortName: nullableStringField(),
  slug: slugField(),
  state: nullableStringField(),
  websiteUrl: nullableStringField(),
} satisfies FieldCodecRecord;

export type CanonicalCompany = ParsedRecord<typeof CompanyFields>;

class CompanyPrismaCodec extends PrismaCodec<CanonicalCompany> {
  public async create(
    tx: Transaction,
    record: CanonicalCompany,
    context: PrismaWriteContext,
    issues: IssueCollector,
  ): Promise<void> {
    const existing = await tx.company.findFirst({
      where: { OR: [{ slug: record.slug }, { name: record.name }] },
    });
    if (existing !== null) {
      await tx.company.update({
        data: {
          ...pick(record, ['logoFileName', 'slug']),
          updatedById: context.userId,
        },
        where: { id: existing.id },
      });
      return;
    }
    if (record.city === null || record.state === null) {
      issues.error(
        'company',
        record.slug,
        'A company that does not exist in the database yet cannot be created without a city and ' +
          'state: both are required legacy columns, and inventing them would fabricate a fact.',
      );
      return;
    }
    await tx.company.create({
      data: {
        ...omitBookkeeping(record, ['city', 'state']),
        city: record.city,
        createdById: context.userId,
        state: record.state,
        updatedById: context.userId,
      },
    });
  }

  public async read(tx: Transaction, issues: IssueCollector): Promise<CanonicalCompany[]> {
    const rows = await tx.company.findMany({ orderBy: { name: 'asc' } });
    return rows.map(row => {
      if (row.slug === null) {
        issues.warning(
          'company',
          row.name,
          'The company has no slug yet; one was derived from its name for the fixture. The next ' +
            'push will persist it.',
        );
      }
      const { createdAt, id, updatedAt, ...company } = row;
      return {
        ...omitBookkeeping(company),
        meta: { createdAt, id, updatedAt },
        slug: company.slug ?? slugify(company.name),
      };
    });
  }
}

export class CompanyBinding extends ContentBinding<typeof CompanyFields> {
  public readonly dependsOn: readonly string[] = [];
  public readonly fixtureFile = 'companies.yaml';
  public readonly fixtureKey = 'companies';
  public readonly fixtureShape = 'list';
  public readonly key = 'company';
  public readonly prisma = new CompanyPrismaCodec();
  public readonly record = new RecordCodec(CompanyFields);

  protected override deriveSlug(record: CanonicalRecord<typeof CompanyFields>): string {
    return slugify(record.name);
  }
}
