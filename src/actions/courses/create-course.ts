'use server';
import { type z } from 'zod';

import { getAuthedUser } from '~/application/auth/server-v2';
import { type BrandCourse, type BrandEducation, calculateSkillsExperience } from '~/database/model';
import { db } from '~/database/prisma';
import { logger } from '~/internal/logger';
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

export const createCourse = async (
  data: z.infer<typeof CourseSchema>,
): Promise<MutationActionResponse<BrandCourse>> => {
  const { error, isAdmin, user } = await getAuthedUser();
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

  const { education: _education, skills: _skills, slug: _slug, ...rest } = parsed.data;

  const slug = _slug ?? slugify(rest.name);
  const fieldErrors = new ApiClientFieldErrors();

  if (await db.course.count({ where: { name: rest.name } })) {
    fieldErrors.addUnique('name', 'The name must be unique.');
    /* If the slug is not explicitly provided and the name does not violate the unique constraint,
       but the slugified form of the name does, this should be a more specific error message. */
  } else if (!_slug && (await db.course.count({ where: { slug } }))) {
    fieldErrors.addUnique(
      'slug',
      'The auto-generated slug for the name is not unique. Please provide a unique slug.',
    );
  }
  if (_slug && (await db.course.count({ where: { slug: _slug } }))) {
    fieldErrors.addUnique('slug', 'The slug must be unique.');
  }

  const education = await db.education.findUnique({ where: { id: _education } });
  if (!education) {
    fieldErrors.addDoesNotExist('education', 'The education does not exist.');
  }

  const [skills] = await queryM2MsDynamically(db, {
    fieldErrors,
    ids: _skills,
    model: 'skill',
  });

  if (!fieldErrors.isEmpty) {
    return { error: fieldErrors.json };
  }
  return await db.$transaction(async tx => {
    const course = await tx.course.create({
      data: {
        ...rest,
        createdById: user.id,
        /* Type coercion is safe because if the education is null, the field errors object will not
           be empty. */
        educationId: (education as BrandEducation).id,
        skills: skills ? { connect: skills.map(skill => ({ id: skill.id })) } : undefined,
        slug,
        updatedById: user.id,
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
