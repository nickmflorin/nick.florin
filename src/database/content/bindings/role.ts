import { ContentOwnerType } from '~/database/model';
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

export const RoleFields = {
  city: nullableStringField(),
  company: slugRefField('company'),
  content: recordField(ContentTreeCodec),
  endDate: nullableDateField(),
  isCurrent: flagField(),
  isHighlighted: flagField(),
  isRemote: flagField(),
  shortTitle: nullableStringField(),
  slug: slugField(),
  startDate: dateField(),
  state: nullableStringField(),
  title: stringField(),
} satisfies FieldCodecRecord;

export type CanonicalRole = ParsedRecord<typeof RoleFields>;

/**
 * The `Role` aggregate: one fixture record, but a `Role` row plus its polymorphic content tree in
 * the database. The tree's owner-level syndication fields (`content.isVisible`,
 * `content.channels`) and chip-row competencies map to columns and relations of the
 * `Role` row itself, not to rows of their own.
 */
class RolePrismaCodec extends PrismaCodec<CanonicalRole> {
  public override readonly deletionPolicy = 'delete';

  public async delete(tx: Transaction, record: CanonicalRole): Promise<void> {
    const id = targetId('role', record);
    await deleteContentNodes(tx, id, ContentOwnerType.ROLE);
    await tx.role.delete({ where: { id } });
  }

  public async read(tx: Transaction, issues: IssueCollector): Promise<CanonicalRole[]> {
    const rows = await tx.role.findMany({
      include: { company: true, competencies: { orderBy: { slug: 'asc' } } },
      orderBy: { startDate: 'desc' },
    });
    const trees = await readContentTrees(tx, ContentOwnerType.ROLE);
    return rows.map(row => {
      if (row.company.slug === null) {
        issues.warning(
          'role',
          row.slug,
          `The company '${row.company.name}' has no slug yet; one was derived from its name for ` +
            'the fixture reference.',
        );
      }
      const { channels, company, competencies, createdAt, id, isVisible, updatedAt, ...role } = row;
      const tree = trees.get(id) ?? { content: [], summary: [] };
      return {
        ...omitBookkeeping(role),
        company: company.slug ?? slugify(company.name),
        content: {
          channels,
          competencies: competencies.map(competency => competency.slug),
          content: tree.content,
          isVisible,
          meta: null,
          summary: tree.summary,
        },
        meta: { createdAt, id, updatedAt },
      };
    });
  }

  public async write(
    tx: Transaction,
    plan: RecordWritePlan<CanonicalRole>,
    context: PrismaWriteContext,
    issues: IssueCollector,
  ): Promise<void> {
    const { existing, record } = plan;
    const owned = {
      channels: record.content.channels,
      companyId: await idOfSlug(tx.company, record.company),
      isVisible: record.content.isVisible,
    };
    const id =
      existing === null
        ? (
            await tx.role.create({
              data: {
                ...omitBookkeeping(record, ['company', 'content']),
                ...owned,
                competencies: {
                  connect: record.content.competencies.map(slug => ({ slug })),
                },
                createdAt: context.inheritedCreatedAt(
                  {
                    company: record.company,
                    entity: 'role',
                    slug: record.slug,
                    title: record.title,
                  },
                  issues,
                ),
                createdById: context.userId,
                updatedById: context.userId,
              },
            })
          ).id
        : targetId('role', existing);

    if (existing !== null) {
      await tx.role.update({
        data: {
          ...omitBookkeeping(record, ['company', 'content']),
          ...owned,
          competencies: { set: record.content.competencies.map(slug => ({ slug })) },
          updatedById: context.userId,
        },
        where: { id },
      });
    }
    await reconcileContentNodes(tx, id, ContentOwnerType.ROLE, record.content, context);
  }
}

export class RoleBinding extends ContentBinding<typeof RoleFields> {
  public readonly dependsOn: readonly string[] = ['company', 'competency'];
  public readonly fixtureFile = 'roles.yaml';
  public readonly fixtureKey = 'roles';
  public readonly fixtureShape = 'list';
  public readonly key = 'role';
  public readonly prisma = new RolePrismaCodec();
  public readonly record = new RecordCodec(RoleFields);

  protected override deriveSlug(record: CanonicalRecord<typeof RoleFields>): string {
    return `${record.company}-${slugify(record.title)}`;
  }

  protected override finalize(
    record: CanonicalRecord<typeof RoleFields>,
  ): CanonicalRecord<typeof RoleFields> {
    return { ...record, content: stampContentTreeChannels(stampContentTreeSlugs(record.content)) };
  }

  protected override validate(record: CanonicalRole, issues: IssueCollector): void {
    validateContentTree(this.key, record.slug, record.content, issues);
    if (record.isRemote && (record.city !== null || record.state !== null)) {
      issues.error(
        this.key,
        record.slug,
        'A remote role carries no city or state: it renders as `Remote`, and a stale location ' +
          'beside the flag would be contradictory.',
      );
    }
  }

  public override references(record: CanonicalRole): SlugReference[] {
    return [...super.references(record), ...contentTreeReferences(record.content)];
  }

  /**
   * Collapses the tree's inherited channel grants back to the authoring shape before encoding, so
   * that a node states a grant only where it narrows its parent's. This is the encode half of the
   * inheritance rule {@link RoleBinding.finalize} resolves on the way in.
   */
  public override serialize(record: CanonicalRole): Record<string, unknown> {
    return super.serialize({ ...record, content: collapseContentTreeChannels(record.content) });
  }
}
