'use server';
import { type z } from 'zod';

import { getAuthedUser } from '~/application/auth/server-v2';
import { type BrandCourse, calculateSkillsExperience, type Education } from '~/database/model';
import { db } from '~/database/prisma';
import { slugify } from '~/lib/formatters';

import { type MutationActionResponse } from '~/actions';
import { queryM2MsDynamically } from '~/actions/m2ms';
import { CourseSchema } from '~/actions/schemas';
import {
  ApiClientFieldErrors,
  ApiClientFormError,
  ApiClientGlobalError,
  convertToPlainObject,
} from '~/api';

const UpdateCourseSchema = CourseSchema.partial();

export const updateCourse = async (
  courseId: string,
  data: z.infer<typeof UpdateCourseSchema>,
): Promise<MutationActionResponse<BrandCourse>> => {
  const { error, isAdmin, user } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }

  const course = await db.course.findUnique({
    include: { education: true, skills: true },
    where: { id: courseId },
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
  const { education: _education, name: _name, skills: _skills, slug: _slug, ...rest } = parsed.data;

  const name = _name ?? course.name;

  if (_name !== undefined && _name.trim() !== course.name.trim()) {
    if (await db.course.count({ where: { id: { notIn: [course.id] }, name: _name } })) {
      fieldErrors.addUnique('name', 'The name must be unique.');
      /* If the slug is being cleared, we have to make sure that the slugified version of the new
         name is still unique. */
    } else if (
      _slug === null &&
      (await db.course.count({
        where: { id: { notIn: [course.id] }, slug: slugify(_name) },
      }))
    ) {
      fieldErrors.addUnique('name', 'The name does not generate a unique slug.');
    }
  } else if (
    _slug === null &&
    (await db.course.count({
      where: { id: { notIn: [course.id] }, slug: slugify(name) },
    }))
  ) {
    /* Here, the slug should be provided explicitly, rather than cleared.  The error is shown in
       regard to the slug, not the name, because the slug is what is being cleared whereas the name
       remains unchanged. */
    fieldErrors.addUnique(
      'slug',
      'The name generates a non-unique slug, so the slug must be provided.',
    );
  } else if (
    _slug !== null &&
    _slug !== undefined &&
    (await db.course.count({ where: { id: { notIn: [course.id] }, slug: _slug } }))
  ) {
    fieldErrors.addUnique('slug', 'The slug must be unique.');
  }

  const [skills] = await queryM2MsDynamically(db, {
    fieldErrors,
    ids: _skills,
    model: 'skill',
  });

  let education: Education | null = null;
  if (_education) {
    education = await db.education.findUnique({ where: { id: _education } });
    if (!education) {
      fieldErrors.addDoesNotExist('education', 'The education does not exist.');
    }
  }

  if (!fieldErrors.isEmpty) {
    return { error: fieldErrors.json };
  }

  const sks = [...course.skills.map(sk => sk.id), ...(skills ?? []).map(sk => sk.id)];
  return await db.$transaction(async tx => {
    const updated = await tx.course.update({
      data: {
        ...rest,
        educationId: education ? education.id : undefined,
        name: _name === undefined || _name.trim() === course.name.trim() ? undefined : _name.trim(),
        skills: skills ? { set: skills.map(skill => ({ id: skill.id })) } : undefined,
        slug: _slug === undefined ? undefined : _slug === null ? slugify(name) : _slug.trim(),
        updatedById: user.id,
      },
      where: { id: course.id },
    });
    await calculateSkillsExperience(tx, sks, { user });
    return { data: convertToPlainObject(updated) };
  });
};
