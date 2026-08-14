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

/**
 * Why a course absent from the database cannot be created by a push: `Course.educationId` is a
 * required legacy column that the fixture deliberately does not carry, because the education a
 * course belongs to is the legacy side of a relation the new model expresses through its degree.
 */
const UncreatableCourseMessage =
  'A course that does not exist in the database yet cannot be created by the push: the legacy ' +
  '`educationId` column is required and the fixture deliberately does not carry it. Create the ' +
  'course through the legacy path first.';

class CoursePrismaCodec extends PrismaCodec<CanonicalCourse> {
  public override readonly writableFields = ['channels', 'competencies', 'degree'];

  /**
   * A course with no counterpart row is refused while the change set is still being planned, so
   * that the run fails before writing anything rather than partway through.
   */
  public override planIssues(plan: RecordWritePlan<CanonicalCourse>, issues: IssueCollector): void {
    if (plan.action === 'create') {
      issues.error('course', plan.record.slug, UncreatableCourseMessage);
    }
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

  public async write(
    tx: Transaction,
    plan: RecordWritePlan<CanonicalCourse>,
    context: PrismaWriteContext,
    issues: IssueCollector,
  ): Promise<void> {
    const { existing, record } = plan;
    if (existing === null) {
      issues.error('course', record.slug, UncreatableCourseMessage);
      return;
    }
    await tx.course.update({
      data: {
        channels: [...record.channels],
        competencies: { set: record.competencies.map(slug => ({ slug })) },
        degreeId: await idOfSlug(tx.degree, record.degree),
        updatedById: context.userId,
      },
      where: { id: targetId('course', existing) },
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

  public override alternateKeys(record: CanonicalCourse): readonly string[] {
    return [record.name];
  }
}
