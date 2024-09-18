"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server";
import { type BrandCourse, type Education } from "~/database/model";
import { calculateSkillsExperience } from "~/database/model";
import { db } from "~/database/prisma";
import { slugify } from "~/lib/formatters";

import { CourseSchema } from "~/actions-v2/schemas";
import { ApiClientFieldErrors, ApiClientGlobalError, type ApiClientErrorJson } from "~/api";
import { convertToPlainObject } from "~/api/serialization";

import { queryM2MsDynamically } from "../m2ms";

const UpdateCourseSchema = CourseSchema.partial();

export const updateCourse = async (
  id: string,
  req: z.infer<typeof UpdateCourseSchema>,
): Promise<ApiClientErrorJson<keyof (typeof UpdateCourseSchema)["shape"]> | BrandCourse> => {
  const { user } = await getAuthedUser();

  const parsed = UpdateCourseSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFieldErrors.fromZodError(parsed.error, UpdateCourseSchema).json;
  }

  return await db.$transaction(async tx => {
    const course = await tx.course.findUnique({ where: { id }, include: { skills: true } });
    if (!course) {
      throw ApiClientGlobalError.NotFound();
    }
    const parsed = UpdateCourseSchema.safeParse(req);
    if (!parsed.success) {
      return ApiClientFieldErrors.fromZodError(parsed.error, UpdateCourseSchema).json;
    }

    const fieldErrors = new ApiClientFieldErrors();
    const {
      slug: _slug,
      skills: _skills,
      name: _name,
      education: _education,
      ...data
    } = parsed.data;

    const name = _name !== undefined ? _name : course.name;

    if (_name !== undefined && _name.trim() !== course.name.trim()) {
      if (await tx.course.count({ where: { name: _name, id: { notIn: [course.id] } } })) {
        fieldErrors.addUnique("name", "The name must be unique.");
        /* If the slug is being cleared, we have to make sure that the slugified version of the new
           name is still unique. */
      } else if (
        _slug === null &&
        (await tx.course.count({
          where: { slug: slugify(_name), id: { notIn: [course.id] } },
        }))
      ) {
        // Here, the slug should be provided explicitly, rather than cleared.
        fieldErrors.addUnique("name", "The name does not generate a unique slug.");
      }
    } else if (
      _slug === null &&
      (await tx.course.count({
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
      (await tx.course.count({ where: { slug: _slug, id: { notIn: [course.id] } } }))
    ) {
      fieldErrors.addUnique("slug", "The slug must be unique.");
    }

    let education: Education | null = null;
    if (_education) {
      education = await tx.education.findUnique({ where: { id: _education } });
      if (!education) {
        fieldErrors.addDoesNotExist("education", "The education does not exist.");
      }
    }

    const [skills] = await queryM2MsDynamically(tx, {
      model: "skill",
      ids: _skills,
      fieldErrors,
    });

    if (!fieldErrors.isEmpty) {
      return fieldErrors.json;
    }

    const sks = [...course.skills.map(sk => sk.id), ...(skills ?? []).map(sk => sk.id)];
    const updated = await tx.course.update({
      where: { id },
      data: {
        ...data,
        educationId: education ? education.id : undefined,
        slug: _slug === undefined ? undefined : _slug === null ? slugify(name) : _slug.trim(),
        name: _name === undefined || _name.trim() === course.name.trim() ? undefined : _name.trim(),
        updatedById: user.id,
        skills: skills ? { set: skills.map(skill => ({ id: skill.id })) } : undefined,
      },
    });
    await calculateSkillsExperience(tx, sks, { user });
    return convertToPlainObject(updated);
  });
};
