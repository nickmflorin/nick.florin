import { type z } from 'zod';

import { type EducationJsonSchema } from '~/database/fixtures';
import { type Course, type Education, type Skill } from '~/database/model';
import { getUniqueConstraintFields, type Transaction } from '~/database/prisma';
import { humanizeList, slugify } from '~/lib/formatters';
import { type cli } from '~/scripts';
import { type SeedStdout } from '~/support/stdout';

export async function seedCourses(
  tx: Transaction,
  ctx: cli.ScriptContext,
  education: Education,
  jsonEducation: z.infer<typeof EducationJsonSchema>,
  output: SeedStdout,
) {
  if (jsonEducation.courses !== undefined) {
    output.begin(
      `Generating ${jsonEducation.courses.length} Courses for Education w Major: ` +
        `'${education.major}'...`,
    );
    let courses: Course[] = [];
    for (let i = 0; i < jsonEducation.courses.length; i++) {
      const { skills: jsonSkills = [], ...jsonCourse } = jsonEducation.courses[i];
      output.begin(`Generating Course: ${jsonCourse.name}...`);

      let course: { readonly skills: Skill[] } & Course;
      try {
        /* eslint-disable-next-line no-await-in-loop -- The queries are issued sequentially, in
           order, against a shared transaction client. */
        course = await tx.course.create({
          data: {
            ...jsonCourse,
            createdById: ctx.user.id,
            educationId: education.id,
            skills: {
              connect: jsonSkills.map(skill => ({
                slug: skill,
              })),
            },
            slug: jsonCourse.slug ?? slugify(jsonCourse.name),
            updatedById: ctx.user.id,
          },
          include: { skills: true },
        });
      } catch (e) {
        const fields = getUniqueConstraintFields(e);
        if (fields !== null && fields.length !== 0) {
          throw new Error(
            'The following field(s) are not unique: ' +
              humanizeList(fields, { conjunction: 'and', formatter: field => `'${field}'` }),
          );
        }
        throw e;
      }
      courses = [...courses];

      output.complete('Successfully Generated Course', {
        count: [i, jsonEducation.courses.length],
        lineItems: [
          { label: 'Name', value: course.name },
          { label: 'Slug', value: course.slug },
          course.skills.length === 0
            ? null
            : {
                items: course.skills.map(sk => ({ label: 'Slug', value: sk.slug })),
                label: 'Skills',
              },
        ],
      });
    }
    output.complete(
      `Successfully Created ${courses.length} Courses for Education w Major: '${education.major}'`,
      { indexLineItems: true, lineItems: courses.map(c => c.name) },
    );
  }
}
