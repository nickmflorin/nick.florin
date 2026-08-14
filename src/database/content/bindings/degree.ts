import { ContentOwnerType, DegreeType } from '~/database/model';
import { type Transaction } from '~/database/prisma';
import { slugify } from '~/lib/formatters/slugify';

import { omitBookkeeping } from '../bookkeeping';
import {
  idOfSlug,
  PrismaCodec,
  type PrismaWriteContext,
  type RecordWritePlan,
  targetId,
} from '../codecs/prisma-codec';
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
  collapseContentTreeChannels,
  ContentTreeCodec,
  contentTreeReferences,
  deleteContentNodes,
  readContentTrees,
  reconcileContentNodes,
  stampContentTreeChannels,
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
  public override readonly deletionPolicy = 'delete';

  public async delete(tx: Transaction, record: CanonicalDegree): Promise<void> {
    const id = targetId('degree', record);
    await deleteContentNodes(tx, id, ContentOwnerType.DEGREE);
    await tx.degree.delete({ where: { id } });
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
      const { channels, competencies, createdAt, id, isVisible, school, updatedAt, ...degree } =
        row;
      const tree = trees.get(id) ?? { content: [], summary: [] };
      return {
        ...omitBookkeeping(degree),
        content: {
          channels,
          competencies: competencies.map(competency => competency.slug),
          content: tree.content,
          isVisible,
          meta: null,
          summary: tree.summary,
        },
        meta: { createdAt, id, updatedAt },
        school: school.slug ?? slugify(school.name),
      };
    });
  }

  public async write(
    tx: Transaction,
    plan: RecordWritePlan<CanonicalDegree>,
    context: PrismaWriteContext,
    issues: IssueCollector,
  ): Promise<void> {
    const { existing, record } = plan;
    const owned = {
      channels: record.content.channels,
      isVisible: record.content.isVisible,
      schoolId: await idOfSlug(tx.school, record.school),
    };
    const id =
      existing === null
        ? (
            await tx.degree.create({
              data: {
                ...omitBookkeeping(record, ['content', 'school']),
                ...owned,
                competencies: {
                  connect: record.content.competencies.map(slug => ({ slug })),
                },
                createdAt: context.inheritedCreatedAt(
                  {
                    entity: 'degree',
                    major: record.major,
                    school: record.school,
                    shortMajor: record.shortMajor,
                    slug: record.slug,
                  },
                  issues,
                ),
                createdById: context.userId,
                updatedById: context.userId,
              },
            })
          ).id
        : targetId('degree', existing);

    if (existing !== null) {
      await tx.degree.update({
        data: {
          ...omitBookkeeping(record, ['content', 'school']),
          ...owned,
          competencies: { set: record.content.competencies.map(slug => ({ slug })) },
          updatedById: context.userId,
        },
        where: { id },
      });
    }
    await reconcileContentNodes(tx, id, ContentOwnerType.DEGREE, record.content, context);
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
    return { ...record, content: stampContentTreeChannels(stampContentTreeSlugs(record.content)) };
  }

  protected override validate(record: CanonicalDegree, issues: IssueCollector): void {
    validateContentTree(this.key, record.slug, record.content, issues);
  }

  public override references(record: CanonicalDegree): SlugReference[] {
    return [...super.references(record), ...contentTreeReferences(record.content)];
  }

  /**
   * Collapses the tree's inherited channel grants back to the authoring shape before encoding, so
   * that a node states a grant only where it narrows its parent's. This is the encode half of the
   * inheritance rule {@link DegreeBinding.finalize} resolves on the way in.
   */
  public override serialize(record: CanonicalDegree): Record<string, unknown> {
    return super.serialize({ ...record, content: collapseContentTreeChannels(record.content) });
  }
}
