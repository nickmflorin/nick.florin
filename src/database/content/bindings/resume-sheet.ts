import { type Prisma, ResumeCompetenciesGroupDisplay } from '~/database/model';
import { type Transaction } from '~/database/prisma';

import { omitBookkeeping } from '../bookkeeping';
import { PrismaCodec, type PrismaWriteContext } from '../codecs/prisma-codec';
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

class ResumeSheetPrismaCodec extends PrismaCodec<CanonicalResumeSheet> {
  public async create(
    tx: Transaction,
    record: CanonicalResumeSheet,
    context: PrismaWriteContext,
  ): Promise<void> {
    const existing = await tx.resumeSheet.count();
    const created = await tx.resumeSheet.create({
      data: {
        ...omitBookkeeping(record, ['competencyGroups', 'degrees', 'roles']),
        createdBy: { connect: { id: context.userId } },
        degrees: { connect: record.degrees.map(slug => ({ slug })) },
        order: existing,
        roles: { connect: record.roles.map(slug => ({ slug })) },
        updatedBy: { connect: { id: context.userId } },
      },
    });
    for (const [order, group] of record.competencyGroups.entries()) {
      /* eslint-disable-next-line no-await-in-loop -- Rows are created inside one interactive
         transaction, which does not support concurrent operations. */
      await tx.resumeCompetenciesGroup.create({
        data: {
          ...omitBookkeeping(group, ['competencies']),
          competencies: { connect: group.competencies.map(slug => ({ slug })) },
          createdBy: { connect: { id: context.userId } },
          order,
          resumeSheet: { connect: { id: created.id } },
          updatedBy: { connect: { id: context.userId } },
        },
      });
    }
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
