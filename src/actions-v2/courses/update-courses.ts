"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server-v2";
import { type BrandCourse, calculateSkillsExperience, type Education } from "~/database/model";
import { db } from "~/database/prisma";
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

const UpdateCourseSchema = CourseSchema.partial();

export const updateCourse = async (
  courseId: string,
  data: z.infer<typeof UpdateCourseSchema>,
): Promise<MutationActionResponse<BrandCourse>> => {
  const { user, error, isAdmin } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: { education: true, skills: true },
  });
  if (!course) {
    return { error: ApiClientGlobalError.NotFound({}).json };
  }
  const parsed = UpdateCourseSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: ApiClientFormError.fromZodError({ error: parsed.error }).json,
    };
  }

  const fieldErrors = new ApiClientFieldErrors();
  const { slug: _slug, skills: _skills, name: _name, education: _education, ...rest } = parsed.data;

  const name = _name !== undefined ? _name : course.name;

  if (_name !== undefined && _name.trim() !== course.name.trim()) {
    if (await db.course.count({ where: { name: _name, id: { notIn: [course.id] } } })) {
      fieldErrors.addUnique("name", "The name must be unique.");
      /* If the slug is being cleared, we have to make sure that the slugified version of the new
         name is still unique. */
    } else if (
      _slug === null &&
      (await db.course.count({
        where: { slug: slugify(_name), id: { notIn: [course.id] } },
      }))
    ) {
      // Here, the slug should be provided explicitly, rather than cleared.
      fieldErrors.addUnique("name", "The name does not generate a unique slug.");
    }
  } else if (
    _slug === null &&
    (await db.course.count({
      where: { slug: slugify(name), id: { notIn: [course.id] } },
    }))
  ) {
    /* Here, the slug should be provided explicitly, rather than cleared.  The error is shown in
         regard to the slug, not the name, because the slug is what is being cleared whereas the
         name remains unchanged. */
    fieldErrors.addUnique(
      "slug",
      "The name generates a non-unique slug, so the slug must be provided.",
    );
  } else if (
    _slug !== null &&
    _slug !== undefined &&
    (await db.course.count({ where: { slug: _slug, id: { notIn: [course.id] } } }))
  ) {
    fieldErrors.addUnique("slug", "The slug must be unique.");
  }

  const [skills] = await queryM2MsDynamically(db, {
    model: "skill",
    ids: _skills,
    fieldErrors,
  });

  let education: Education | null = null;
  if (_education) {
    education = await db.education.findUnique({ where: { id: _education } });
    if (!education) {
      fieldErrors.addDoesNotExist("education", "The education does not exist.");
    }
  }

  if (!fieldErrors.isEmpty) {
    return { error: fieldErrors.json };
  }

  const sks = [...course.skills.map(sk => sk.id), ...(skills ?? []).map(sk => sk.id)];
  return await db.$transaction(async tx => {
    const updated = await tx.course.update({
      where: { id: course.id },
      data: {
        ...rest,
        educationId: education ? education.id : undefined,
        slug: _slug === undefined ? undefined : _slug === null ? slugify(name) : _slug.trim(),
        name: _name === undefined || _name.trim() === course.name.trim() ? undefined : _name.trim(),
        updatedById: user.id,
        skills: skills ? { set: skills.map(skill => ({ id: skill.id })) } : undefined,
      },
    });
    await calculateSkillsExperience(tx, sks, { user });
    return { data: convertToPlainObject(updated) };
  });
};
