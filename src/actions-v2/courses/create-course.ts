"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server-v2";
import { type BrandCourse, type BrandEducation } from "~/database/model";
import { calculateSkillsExperience } from "~/database/model";
import { db } from "~/database/prisma";
import { logger } from "~/internal/logger";
import { slugify } from "~/lib/formatters";

import { type MutationActionResponse } from "~/actions-v2";
import { queryM2MsDynamically } from "~/actions-v2/m2ms";
import { CourseSchema } from "~/actions-v2/schemas";
import {
  ApiClientFieldErrors,
  ApiClientGlobalError,
  ApiClientFormError,
  convertToPlainObject,
} from "~/api-v2";

export const createCourse = async (
  data: z.infer<typeof CourseSchema>,
): Promise<MutationActionResponse<BrandCourse>> => {
  const { user, error, isAdmin } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }

  const parsed = CourseSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: ApiClientFormError.fromZodError({ error: parsed.error }).json,
    };
  }

  const { slug: _slug, skills: _skills, education: _education, ...rest } = parsed.data;

  const slug = _slug ?? slugify(rest.name);
  const fieldErrors = new ApiClientFieldErrors();

  if (await db.course.count({ where: { name: rest.name } })) {
    fieldErrors.addUnique("name", "The name must be unique.");
    /* If the slug is not explicitly provided and the name does not violate the unique
       constraint, but the slugified form of the name does, this should be a more specific error
       message. */
  } else if (!_slug && (await db.course.count({ where: { slug } }))) {
    fieldErrors.addUnique(
      "slug",
      "The auto-generated slug for the name is not unique. Please provide a unique slug.",
    );
  }
  if (_slug && (await db.course.count({ where: { slug: _slug } }))) {
    fieldErrors.addUnique("slug", "The slug must be unique.");
  }

  const education = await db.education.findUnique({ where: { id: _education } });
  if (!education) {
    fieldErrors.addDoesNotExist("education", "The education does not exist.");
  }

  const [skills] = await queryM2MsDynamically(db, {
    model: "skill",
    ids: _skills,
    fieldErrors,
  });

  if (!fieldErrors.isEmpty) {
    return { error: fieldErrors.json };
  }
  return await db.$transaction(async tx => {
    const course = await tx.course.create({
      data: {
        ...rest,
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
        `Recalculating experience for ${skills.length} skill(s) associated with new course, ` +
          `'${course.name}'.`,
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
    return { data: convertToPlainObject(course) };
  });
};
