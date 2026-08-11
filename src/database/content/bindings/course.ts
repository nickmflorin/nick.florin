import { type Transaction } from '~/database/prisma';
import { slugify } from '~/lib/formatters/slugify';

import { omitBookkeeping } from '../bookkeeping';
import { PrismaCodec, type PrismaWriteContext } from '../codecs/prisma-codec';
import { type CanonicalRecord, RecordCodec } from '../codecs/record-codec';
import { type FieldCodecRecord } from '../fields/field-codec';
import {
  channelsField,
  nullableStringField,
  slugField,
  slugRefField,
  slugRefListField,
  stringField,
  visibilityField,
} from '../fields/primitives';
import { type IssueCollector } from '../issues';

import { ContentBinding, type ParsedRecord } from './content-binding';

/**
 * `Course` is a reused legacy model (carried over intact, decided 2026-08-11), re-parented onto
 * `Degree` through the additive nullable `degreeId` — the fixture references the degree by slug,
 * and the legacy `educationId` stays untouched until adoption. Because `educationId` is a required
 * legacy column that the fixture deliberately does not carry, a course that does not already exist
 * in the database cannot be created by the push; it is reported instead of fabricated.
 */
export const CourseFields = {
  channels: channelsField(),
  competencies: slugRefListField('competency'),
  degree: slugRefField('degree'),
  description: nullableStringField(),
  name: stringField(),
  shortName: nullableStringField(),
  slug: slugField(),
  visible: visibilityField(),
} satisfies FieldCodecRecord;

export type CanonicalCourse = ParsedRecord<typeof CourseFields>;

class CoursePrismaCodec extends PrismaCodec<CanonicalCourse> {
  public async create(
    tx: Transaction,
    record: CanonicalCourse,
    context: PrismaWriteContext,
    issues: IssueCollector,
  ): Promise<void> {
    const existing = await tx.course.findFirst({
      where: { OR: [{ slug: record.slug }, { name: record.name }] },
    });
    if (existing === null) {
      issues.error(
        'course',
        record.slug,
        'A course that does not exist in the database yet cannot be created by the push: the ' +
          'legacy `educationId` column is required and the fixture deliberately does not carry ' +
          'it. Create the course through the legacy path first.',
      );
      return;
    }
    await tx.course.update({
      data: {
        channels: [...record.channels],
        competencies: { set: record.competencies.map(slug => ({ slug })) },
        degree: { connect: { slug: record.degree } },
        updatedBy: { connect: { id: context.userId } },
      },
      where: { id: existing.id },
    });
  }

  public async read(tx: Transaction, issues: IssueCollector): Promise<CanonicalCourse[]> {
    const rows = await tx.course.findMany({
      include: { competencies: { orderBy: { slug: 'asc' } }, degree: true },
      orderBy: { slug: 'asc' },
    });
    return rows.map(row => {
      if (row.degree === null) {
        issues.warning(
          'course',
          row.slug,
          'The course has not been re-parented onto a degree yet; the fixture reference is ' +
            'empty until a push connects it.',
        );
      }
      const {
        competencies,
        createdAt,
        degree,
        degreeId: _degreeId,
        educationId: _educationId,
        id,
        updatedAt,
        ...course
      } = row;
      return {
        ...omitBookkeeping(course),
        competencies: competencies.map(competency => competency.slug),
        degree: degree?.slug ?? '',
        meta: { createdAt, id, updatedAt },
      };
    });
  }
}

export class CourseBinding extends ContentBinding<typeof CourseFields> {
  public readonly dependsOn: readonly string[] = ['competency', 'degree'];
  public readonly fixtureFile = 'courses.yaml';
  public readonly fixtureKey = 'courses';
  public readonly fixtureShape = 'list';
  public readonly key = 'course';
  public readonly prisma = new CoursePrismaCodec();
  public readonly record = new RecordCodec(CourseFields);

  protected override deriveSlug(record: CanonicalRecord<typeof CourseFields>): string {
    return slugify(record.name);
  }
}
