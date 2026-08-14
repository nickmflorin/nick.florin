import { type Prisma, ResumeCompetenciesGroupDisplay } from '~/database/model';
import { type Transaction } from '~/database/prisma';

import { omitBookkeeping } from '../bookkeeping';
import { type ChildCollectionAdapter, reconcileChildren } from '../codecs/child-collection';
import {
  PrismaCodec,
  type PrismaWriteContext,
  type RecordWritePlan,
  targetId,
} from '../codecs/prisma-codec';
import { type CanonicalRecord, RecordCodec, recordListField } from '../codecs/record-codec';
import { type FieldCodecRecord } from '../fields/field-codec';
import {
  enumField,
  flagField,
  nullableStringField,
  slugField,
  slugRefListField,
  stringField,
} from '../fields/primitives';

import { ContentBinding, type ParsedRecord } from './content-binding';

const CompetencyGroupFields = {
  competencies: slugRefListField('competency'),
  display: enumField(ResumeCompetenciesGroupDisplay),
  heading: stringField(),
  shortHeading: nullableStringField(),
  slug: stringField(),
} satisfies FieldCodecRecord;

const CompetencyGroupCodec = new RecordCodec(CompetencyGroupFields);

/**
 * A sheet's competency groups nest inside the sheet record because a group belongs to exactly one
 * sheet; the sheet's roles and degrees are slug references, because the sheet names what it
 * carries and nothing else about it.
 */
export const ResumeSheetFields = {
  competencyGroups: recordListField(CompetencyGroupCodec),
  degrees: slugRefListField('degree'),
  isIntroVisible: flagField(),
  roles: slugRefListField('role'),
  /* A sheet's slug doubles as the emitted filename and has no natural name to derive from, so it
     must be authored even though the field itself is the optional slug codec. */
  slug: slugField(),
} satisfies FieldCodecRecord;

export type CanonicalResumeSheet = ParsedRecord<typeof ResumeSheetFields>;

type SheetRow = Prisma.ResumeSheetGetPayload<{
  include: {
    competencyGroups: { include: { competencies: true } };
    degrees: true;
    roles: true;
  };
}>;

const fromGroupRow = ({
  competencies,
  createdAt,
  id,
  updatedAt,
  ...group
}: SheetRow['competencyGroups'][number]): CanonicalRecord<typeof CompetencyGroupFields> => ({
  ...omitBookkeeping(group),
  competencies: competencies.map(competency => competency.slug),
  meta: { createdAt, id, updatedAt },
});

type CanonicalCompetencyGroup = CanonicalRecord<typeof CompetencyGroupFields>;

const competencyGroupAdapter = (
  resumeSheetId: string,
): ChildCollectionAdapter<CanonicalCompetencyGroup> => ({
  create: async (tx, group, order, context) => {
    await tx.resumeCompetenciesGroup.create({
      data: {
        ...omitBookkeeping(group, ['competencies']),
        competencies: { connect: group.competencies.map(slug => ({ slug })) },
        createdById: context.userId,
        order,
        resumeSheetId,
        updatedById: context.userId,
      },
    });
  },
  existing: async tx => {
    const rows = await tx.resumeCompetenciesGroup.findMany({
      select: { id: true, slug: true },
      where: { resumeSheetId },
    });
    return new Map(rows.map(row => [row.slug, row.id]));
  },
  remove: async (tx, id) => {
    await tx.resumeCompetenciesGroup.delete({ where: { id } });
  },
  slugOf: group => group.slug,
  update: async (tx, id, group, order, context) => {
    await tx.resumeCompetenciesGroup.update({
      data: {
        ...omitBookkeeping(group, ['competencies']),
        competencies: { set: group.competencies.map(slug => ({ slug })) },
        order,
        updatedById: context.userId,
      },
      where: { id },
    });
  },
});

class ResumeSheetPrismaCodec extends PrismaCodec<CanonicalResumeSheet> {
  public override readonly deletionPolicy = 'delete';

  public async delete(tx: Transaction, record: CanonicalResumeSheet): Promise<void> {
    await tx.resumeSheet.delete({ where: { id: targetId('resume-sheet', record) } });
  }

  public async read(tx: Transaction): Promise<CanonicalResumeSheet[]> {
    const rows = await tx.resumeSheet.findMany({
      include: {
        competencyGroups: {
          include: { competencies: { orderBy: { slug: 'asc' } } },
          orderBy: { order: 'asc' },
        },
        degrees: { orderBy: { startDate: 'desc' } },
        roles: { orderBy: { startDate: 'desc' } },
      },
      orderBy: { order: 'asc' },
    });
    return rows.map(({ competencyGroups, createdAt, degrees, id, roles, updatedAt, ...sheet }) => ({
      ...omitBookkeeping(sheet),
      competencyGroups: competencyGroups.map(fromGroupRow),
      degrees: degrees.map(degree => degree.slug),
      meta: { createdAt, id, updatedAt },
      roles: roles.map(role => role.slug),
    }));
  }

  public async write(
    tx: Transaction,
    plan: RecordWritePlan<CanonicalResumeSheet>,
    context: PrismaWriteContext,
  ): Promise<void> {
    const { existing, record } = plan;
    const scalars = {
      ...omitBookkeeping(record, ['competencyGroups', 'degrees', 'roles']),
      order: plan.index,
    };
    const degrees = record.degrees.map(slug => ({ slug }));
    const roles = record.roles.map(slug => ({ slug }));
    /* The sheet's roles and degrees are a one-to-many owned through a foreign key on the referenced
       row, so an update reassigns them wholesale with `set` — which is also why a role listed on
       two sheets is rejected by the set-level validation before a write is ever planned. A create
       has nothing to reassign, and `set` is not a legal operation there. */
    const id =
      existing === null
        ? (
            await tx.resumeSheet.create({
              data: {
                ...scalars,
                createdById: context.userId,
                degrees: { connect: degrees },
                roles: { connect: roles },
                updatedById: context.userId,
              },
            })
          ).id
        : targetId('resume-sheet', existing);

    if (existing !== null) {
      await tx.resumeSheet.update({
        data: {
          ...scalars,
          degrees: { set: degrees },
          roles: { set: roles },
          updatedById: context.userId,
        },
        where: { id },
      });
    }
    await reconcileChildren(tx, record.competencyGroups, competencyGroupAdapter(id), context);
  }
}

export class ResumeSheetBinding extends ContentBinding<typeof ResumeSheetFields> {
  public readonly dependsOn: readonly string[] = ['competency', 'degree', 'role'];
  public readonly fixtureFile = 'resume-sheets.yaml';
  public readonly fixtureKey = 'sheets';
  public readonly fixtureShape = 'list';
  public readonly key = 'resume-sheet';
  public readonly prisma = new ResumeSheetPrismaCodec();
  public readonly record = new RecordCodec(ResumeSheetFields);
}
