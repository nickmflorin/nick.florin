"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server";
import { logger } from "~/application/logger";
import { slugify } from "~/lib/formatters";
import { prisma } from "~/prisma/client";
import { type BrandEducation } from "~/prisma/model";
import { calculateSkillsExperience } from "~/prisma/model";
import { ApiClientFieldErrors } from "~/api";
import { CourseSchema } from "~/api/schemas";
import { convertToPlainObject } from "~/api/serialization";

import { queryM2MsDynamically } from "../m2ms";

export const createCourse = async (req: z.infer<typeof CourseSchema>) => {
  const { user } = await getAuthedUser();

  const parsed = CourseSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFieldErrors.fromZodError(parsed.error, CourseSchema).json;
  }
  const { slug: _slug, skills: _skills, education: _education, ...data } = parsed.data;

  const slug = _slug ?? slugify(data.name);

  const fieldErrors = new ApiClientFieldErrors();

  return await prisma.$transaction(async tx => {
    if (await tx.course.count({ where: { name: data.name } })) {
      fieldErrors.addUnique("name", "The name must be unique.");
      /* If the slug is not explicitly provided and the name does not violate the unique
         constraint, but the slugified form of the name does, this should be a more specific error
         message. */
    } else if (!_slug && (await tx.course.count({ where: { slug } }))) {
      fieldErrors.addUnique(
        "slug",
        "The auto-generated slug for the name is not unique. Please provide a unique slug.",
      );
    }
    if (_slug && (await tx.course.count({ where: { slug: _slug } }))) {
      fieldErrors.addUnique("slug", "The slug must be unique.");
    }
    const education = await tx.education.findUnique({ where: { id: _education } });
    if (!education) {
      fieldErrors.addDoesNotExist("education", "The education does not exist.");
    }

    const [skills] = await queryM2MsDynamically(tx, {
      model: "skill",
      ids: _skills,
      fieldErrors,
    });

    if (!fieldErrors.isEmpty) {
      return fieldErrors.json;
    }

    const course = await tx.course.create({
      data: {
        ...data,
        slug,
        /* Type coercion is safe because if the education is null, the field errors object will
           not be empty. */
        educationId: (education as BrandEducation).id,
        createdById: user.id,
        updatedById: user.id,
        skills: skills ? { connect: skills.map(skill => ({ id: skill.id })) } : undefined,
      },
    });
    if (skills && skills.length !== 0) {
      logger.info(
        `Recalculating experience for ${skills.length} skill(s) associated with new course, '${course.name}'.`,
        { courseId: course.id, skills: skills.map(s => s.id) },
      );
      await calculateSkillsExperience(
        tx,
        skills.map(sk => sk.id),
        { user },
      );
      logger.info(
        `Successfully recalculated experience for ${skills.length} skill(s) associated with ` +
          `new course, '${course.name}'.`,
        { courseId: course.id, skills: skills.map(s => s.id) },
      );
    }
    return convertToPlainObject(course);
  });
};
