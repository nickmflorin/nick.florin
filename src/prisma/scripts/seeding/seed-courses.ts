import { type z } from "zod";

import { slugify, humanizeList } from "~/lib/formatters";

import { prisma, getUniqueConstraintFields } from "../../client";
import { type Course, type Education } from "../../model";
import { type EducationJsonSchema } from "../fixtures/schemas";

import { findCorrespondingSkills } from "./seed-skills";
import { type SeedStdout } from "./stdout";
import { type SeedContext } from "./types";

export async function seedCourses(
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

      let course: Course;
      try {
        course = await prisma.course.create({
          data: {
            ...jsonCourse,
            educationId: education.id,
            slug: jsonCourse.slug === undefined ? slugify(jsonCourse.name) : jsonCourse.slug,
            createdById: ctx.user.id,
            updatedById: ctx.user.id,
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

      if (jsonSkills.length !== 0) {
        output.begin(`Associating ${jsonSkills.length} Skills(s) with Course: ${course.name}...`);
        const skills = await findCorrespondingSkills(jsonSkills);
        const relationships = await prisma.courseOnSkills.createMany({
          data: skills.map(skill => ({
            assignedById: ctx.user.id,
            skillId: skill.id,
            courseId: course.id,
          })),
        });
        output.complete(`Associated ${relationships.count} Skills(s) with Course: ${course.name}`, {
          lineItems: skills.map(sk => sk.label),
          indexLineItems: true,
        });
      }

      output.complete("Successfully Generated Course", {
        lineItems: [
          { label: "Name", value: course.name },
          { label: "Slug", value: course.slug },
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
