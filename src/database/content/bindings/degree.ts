import { ContentOwnerType, DegreeType } from '~/database/model';
import { type Transaction } from '~/database/prisma';
import { slugify } from '~/lib/formatters/slugify';

import { omitBookkeeping } from '../bookkeeping';
import { PrismaCodec, type PrismaWriteContext } from '../codecs/prisma-codec';
import { type CanonicalRecord, RecordCodec, recordField } from '../codecs/record-codec';
import { type FieldCodecRecord } from '../fields/field-codec';
import {
  dateField,
  enumField,
  flagField,
  nullableDateField,
  nullableStringField,
  slugField,
  slugRefField,
  stringField,
} from '../fields/primitives';
import { type IssueCollector } from '../issues';

import { ContentBinding, type ParsedRecord, type SlugReference } from './content-binding';
import {
  ContentTreeCodec,
  contentTreeReferences,
  createContentNodes,
  readContentTrees,
  stampContentTreeSlugs,
  validateContentTree,
} from './content-tree';

export const DegreeFields = {
  concentration: nullableStringField(),
  content: recordField(ContentTreeCodec),
  degree: enumField(DegreeType),
  endDate: nullableDateField(),
  gpa: nullableStringField(),
  isCurrent: flagField(),
  isHighlighted: flagField(),
  isPostponed: flagField(),
  major: stringField(),
  minor: nullableStringField(),
  note: nullableStringField(),
  school: slugRefField('school'),
  shortConcentration: nullableStringField(),
  shortMajor: nullableStringField(),
  shortMinor: nullableStringField(),
  shortNote: nullableStringField(),
  slug: slugField(),
  startDate: dateField(),
} satisfies FieldCodecRecord;

export type CanonicalDegree = ParsedRecord<typeof DegreeFields>;

/**
 * The `Degree` aggregate; see the `Role` binding for how the content tree and the owner-level
 * syndication fields map onto the owner's row.
 */
class DegreePrismaCodec extends PrismaCodec<CanonicalDegree> {
  public async create(
    tx: Transaction,
    record: CanonicalDegree,
    context: PrismaWriteContext,
  ): Promise<void> {
    const created = await tx.degree.create({
      data: {
        ...omitBookkeeping(record, ['content', 'school']),
        competencies: {
          connect: record.content.competencies.map(slug => ({ slug })),
        },
        createdBy: { connect: { id: context.userId } },
        excludedChannels: record.content.excludedChannels,
        isVisible: record.content.isVisible,
        school: { connect: { slug: record.school } },
        updatedBy: { connect: { id: context.userId } },
      },
    });
    await createContentNodes(tx, created.id, ContentOwnerType.DEGREE, record.content, context);
  }

  public async read(tx: Transaction, issues: IssueCollector): Promise<CanonicalDegree[]> {
    const rows = await tx.degree.findMany({
      include: { competencies: { orderBy: { slug: 'asc' } }, school: true },
      orderBy: { startDate: 'desc' },
    });
    const trees = await readContentTrees(tx, ContentOwnerType.DEGREE);
    return rows.map(row => {
      if (row.school.slug === null) {
        issues.warning(
          'degree',
          row.slug,
          `The school '${row.school.name}' has no slug yet; one was derived from its name for ` +
            'the fixture reference.',
        );
      }
      const {
        competencies,
        createdAt,
        excludedChannels,
        id,
        isVisible,
        school,
        updatedAt,
        ...degree
      } = row;
      const tree = trees.get(id) ?? { content: [], summary: [] };
      return {
        ...omitBookkeeping(degree),
        content: {
          competencies: competencies.map(competency => competency.slug),
          content: tree.content,
          excludedChannels,
          isVisible,
          meta: null,
          summary: tree.summary,
        },
        meta: { createdAt, id, updatedAt },
        school: school.slug ?? slugify(school.name),
      };
    });
  }
}

export class DegreeBinding extends ContentBinding<typeof DegreeFields> {
  public readonly dependsOn: readonly string[] = ['school', 'competency'];
  public readonly fixtureFile = 'degrees.yaml';
  public readonly fixtureKey = 'degrees';
  public readonly fixtureShape = 'list';
  public readonly key = 'degree';
  public readonly prisma = new DegreePrismaCodec();
  public readonly record = new RecordCodec(DegreeFields);

  protected override deriveSlug(record: CanonicalRecord<typeof DegreeFields>): string {
    return `${record.school}-${slugify(record.major)}`;
  }

  protected override finalize(
    record: CanonicalRecord<typeof DegreeFields>,
  ): CanonicalRecord<typeof DegreeFields> {
    return { ...record, content: stampContentTreeSlugs(record.content) };
  }

  protected override validate(record: CanonicalDegree, issues: IssueCollector): void {
    validateContentTree(this.key, record.slug, record.content, issues);
  }

  public override references(record: CanonicalDegree): SlugReference[] {
    return [...super.references(record), ...contentTreeReferences(record.content)];
  }
}
