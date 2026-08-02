'use server';
import { type z } from 'zod';

import { getAuthedUser } from '~/application/auth/server-v2';
import { type BrandSkill, calculateSkillsExperience } from '~/database/model';
import { db } from '~/database/prisma';
import { slugify } from '~/lib/formatters';

import { type MutationActionResponse } from '~/actions';
import { queryM2MsDynamically } from '~/actions/m2ms';
import { SkillSchema } from '~/actions/schemas';
import {
  ApiClientFieldErrors,
  ApiClientFormError,
  ApiClientGlobalError,
  convertToPlainObject,
} from '~/api';

export const createSkill = async (
  data: Partial<z.infer<typeof SkillSchema>>,
): Promise<MutationActionResponse<BrandSkill>> => {
  const { error, isAdmin, user } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }

  const parsed = SkillSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: ApiClientFormError.fromZodError({ error: parsed.error }).json,
    };
  }
  const {
    courses: _courses,
    educations: _educations,
    experiences: _experiences,
    projects: _projects,
    repositories: _repositories,
    slug: _slug,
    ...rest
  } = parsed.data;

  const slug = _slug ?? slugify(rest.label);

  const fieldErrors = new ApiClientFieldErrors();

  if (await db.skill.count({ where: { label: rest.label } })) {
    fieldErrors.addUnique('label', 'The label must be unique.');
    /* If the slug is not explicitly provided and the label does not violate the unique constraint,
       but the slugified form of the label does, this should be a more specific error message. */
  } else if (!_slug && (await db.skill.count({ where: { slug } }))) {
    fieldErrors.addUnique(
      'label',
      'The auto-generated slug for the label is not unique. Please either provide a unique ' +
        "slug or change the label such that it's slug is unique.",
    );
  }
  if (_slug && (await db.skill.count({ where: { slug: _slug } }))) {
    fieldErrors.addUnique('slug', 'The slug must be unique.');
  }
  const [experiences] = await queryM2MsDynamically(db, {
    fieldErrors,
    ids: _experiences,
    model: 'experience',
  });
  const [educations] = await queryM2MsDynamically(db, {
    fieldErrors,
    ids: _educations,
    model: 'education',
  });
  const [projects] = await queryM2MsDynamically(db, {
    fieldErrors,
    ids: _projects,
    model: 'project',
  });
  const [repositories] = await queryM2MsDynamically(db, {
    fieldErrors,
    ids: _repositories,
    model: 'repository',
  });
  const [courses] = await queryM2MsDynamically(db, {
    fieldErrors,
    ids: _courses,
    model: 'course',
  });
  if (!fieldErrors.isEmpty) {
    return { error: fieldErrors.json };
  }

  return await db.$transaction(async tx => {
    const skill = await tx.skill.create({
      data: {
        ...rest,
        calculatedExperience: 0,
        courses: courses ? { connect: courses.map(e => ({ id: e.id })) } : undefined,
        createdById: user.id,
        educations: educations ? { connect: educations.map(e => ({ id: e.id })) } : undefined,
        experiences: experiences ? { connect: experiences.map(e => ({ id: e.id })) } : undefined,
        projects: projects ? { connect: projects.map(e => ({ id: e.id })) } : undefined,
        repositories: repositories ? { connect: repositories.map(e => ({ id: e.id })) } : undefined,
        slug,
        updatedById: user.id,
      },
    });
    const calculatedExperience = await calculateSkillsExperience(tx, skill.id, {
      returnAs: 'experience',
      user,
    });
    return { data: convertToPlainObject({ ...skill, calculatedExperience }) };
  });
};
