import { type z } from "zod";

import { slugify } from "~/lib/formatters";

import { prisma, getUniqueConstraintFields } from "../../client";
import { type Education } from "../../model";
import { type EducationJsonSchema } from "../fixtures/schemas";

import { stdout } from "./stdout";
import { type SeedContext } from "./types";

export async function seedCourses(
  ctx: SeedContext,
  education: Education,
  jsonEducation: z.infer<typeof EducationJsonSchema>,
) {
  if (jsonEducation.courses !== undefined) {
    stdout.begin(
      `Generating ${jsonEducation.courses.length} Courses for Education w Major: '${education.major}'...`,
    );
    for (let i = 0; i < jsonEducation.courses.length; i++) {
      const jsonCourse = jsonEducation.courses[i];
      try {
        const course = await prisma.course.create({
          data: {
            ...jsonCourse,
            educationId: education.id,
            slug: jsonCourse.slug === undefined ? slugify(jsonCourse.name) : jsonCourse.slug,
            createdById: ctx.user.id,
            updatedById: ctx.user.id,
          },
        });
        stdout.info("Successfully Generated Course", {
          lineItems: [
            { label: "Name", value: course.name },
            { label: "Slug", value: course.slug },
          ],
          count: [i, jsonEducation.courses.length],
        });
      } catch (e) {
        const fields = getUniqueConstraintFields(e);
        if (fields !== null) {
          if (fields.includes("slug") && fields.includes("name")) {
            throw new Error(
              `The slug '${jsonCourse.slug}' and name '${jsonCourse.name}' are not unique!`,
            );
          } else if (fields.includes("slug")) {
            throw new Error(`The slug '${jsonCourse.slug}' is not unique!`);
          } else if (fields.includes("name")) {
            throw new Error(`The name '${jsonCourse.name}' is not unique!`);
          }
        }
        throw e;
      }
    }
    stdout.complete(
      `Successfully Created ${jsonEducation.courses.length} Courses for Education w Major: '${education.major}'`,
    );
  }
}
