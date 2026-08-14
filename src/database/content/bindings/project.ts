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
  dateField,
  flagField,
  nullableStringField,
  slugField,
  slugRefListField,
  stringField,
} from '../fields/primitives';
import { type IssueCollector } from '../issues';

import { ContentBinding, type ParsedRecord } from './content-binding';

/**
 * `Project` is a reused legacy model (carried over intact, decided 2026-08-11). The push links
 * against an existing row by slug (then by its unique name) and writes only the additive
 * membership — `channels`, competency associations, repository links — while a genuinely new
 * project is created whole; every legacy-required column is in the fixture.
 */
export const ProjectFields = {
  channels: channelsField(),
  competencies: slugRefListField('competency'),
  description: stringField(),
  highlighted: flagField(),
  name: stringField(),
  repositories: slugRefListField('repository'),
  shortName: nullableStringField(),
  slug: slugField(),
  startDate: dateField(),
  /* The legacy column defaults to hidden, so only an affirmative `visible` is authored. */
  visible: flagField(),
} satisfies FieldCodecRecord;

export type CanonicalProject = ParsedRecord<typeof ProjectFields>;

class ProjectPrismaCodec extends PrismaCodec<CanonicalProject> {
  public override readonly writableFields = ['channels', 'competencies', 'repositories'];

  public async read(tx: Transaction, _issues: IssueCollector): Promise<CanonicalProject[]> {
    const rows = await tx.project.findMany({
      include: {
        competencies: { orderBy: { slug: 'asc' } },
        repositories: { orderBy: { slug: 'asc' } },
      },
      orderBy: { slug: 'asc' },
    });
    return rows.map(row => {
      const { competencies, createdAt, id, repositories, updatedAt, ...project } = row;
      return {
        ...omitBookkeeping(project),
        competencies: competencies.map(competency => competency.slug),
        meta: { createdAt, id, updatedAt },
        repositories: repositories.map(repository => repository.slug),
      };
    });
  }

  public async write(
    tx: Transaction,
    plan: RecordWritePlan<CanonicalProject>,
    context: PrismaWriteContext,
  ): Promise<void> {
    const { existing, record } = plan;
    if (existing !== null) {
      await tx.project.update({
        data: {
          channels: [...record.channels],
          competencies: { set: record.competencies.map(slug => ({ slug })) },
          repositories: { set: record.repositories.map(slug => ({ slug })) },
          updatedById: context.userId,
        },
        where: { id: targetId('project', existing) },
      });
      return;
    }
    await tx.project.create({
      data: {
        ...omitBookkeeping(record, ['competencies', 'repositories']),
        channels: [...record.channels],
        competencies: { connect: record.competencies.map(slug => ({ slug })) },
        createdById: context.userId,
        repositories: { connect: record.repositories.map(slug => ({ slug })) },
        updatedById: context.userId,
      },
    });
  }
}

export class ProjectBinding extends ContentBinding<typeof ProjectFields> {
  public readonly dependsOn: readonly string[] = ['competency', 'repository'];
  public readonly fixtureFile = 'projects.yaml';
  public readonly fixtureKey = 'projects';
  public readonly fixtureShape = 'list';
  public readonly key = 'project';
  public readonly prisma = new ProjectPrismaCodec();
  public readonly record = new RecordCodec(ProjectFields);

  protected override deriveSlug(record: CanonicalRecord<typeof ProjectFields>): string {
    return slugify(record.name);
  }

  public override alternateKeys(record: CanonicalProject): readonly string[] {
    return [record.name];
  }
}
