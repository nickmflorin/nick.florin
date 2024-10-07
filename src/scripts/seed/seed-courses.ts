import { type z } from "zod";

import { type EducationJsonSchema } from "~/database/fixtures";
import { type Course, type Education, type Skill } from "~/database/model";
import { getUniqueConstraintFields, type Transaction } from "~/database/prisma";
import { slugify, humanizeList } from "~/lib/formatters";
import { type SeedContext } from "~/scripts/context";
import { type SeedStdout } from "~/support/stdout";

export async function seedCourses(
  tx: Transaction,
  ctx: SeedContext,
  education: Education,
  jsonEducation: z.infer<typeof EducationJsonSchema>,
  output: SeedStdout,
) {
  if (jsonEducation.courses !== undefined) {
    output.begin(
      `Generating ${jsonEducation.courses.length} Courses for Education w Major: '${education.major}'...`,
    );
    let courses: Course[] = [];
    for (let i = 0; i < jsonEducation.courses.length; i++) {
      const { skills: jsonSkills = [], ...jsonCourse } = jsonEducation.courses[i];
      output.begin(`Generating Course: ${jsonCourse.name}...`);

      let course: Course & { readonly skills: Skill[] };
      try {
        course = await tx.course.create({
          include: { skills: true },
          data: {
            ...jsonCourse,
            educationId: education.id,
            slug:
              jsonCourse.slug === undefined || jsonCourse.slug === null
                ? slugify(jsonCourse.name)
                : jsonCourse.slug,
            createdById: ctx.user.id,
            updatedById: ctx.user.id,
            skills: {
              connect: jsonSkills.map(skill => ({
                slug: skill,
              })),
            },
          },
        });
      } catch (e) {
        const fields = getUniqueConstraintFields(e);
        if (fields !== null && fields.length !== 0) {
          throw new Error(
            "The following field(s) are not unique: " +
              humanizeList(fields, { conjunction: "and", formatter: field => `'${field}'` }),
          );
        }
        throw e;
      }
      courses = [...courses];

      output.complete("Successfully Generated Course", {
        lineItems: [
          { label: "Name", value: course.name },
          { label: "Slug", value: course.slug },
          course.skills.length !== 0
            ? {
                label: "Skills",
                items: course.skills.map(sk => ({ label: "Slug", value: sk.slug })),
              }
            : null,
        ],
        count: [i, jsonEducation.courses.length],
      });
    }
    output.complete(
      `Successfully Created ${courses.length} Courses for Education w Major: '${education.major}'`,
      { lineItems: courses.map(c => c.name), indexLineItems: true },
    );
  }
}
