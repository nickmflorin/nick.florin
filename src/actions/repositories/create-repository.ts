'use server';
import { type z } from 'zod';

import { getAuthedUser } from '~/application/auth/server-v2';
import { type BrandRepository, calculateSkillsExperience } from '~/database/model';
import { db } from '~/database/prisma';
import { logger } from '~/internal/logger';

import { type MutationActionResponse } from '~/actions';
import { queryM2MsDynamically } from '~/actions/m2ms';
import { RepositorySchema } from '~/actions/schemas';
import {
  ApiClientFieldErrors,
  ApiClientFormError,
  ApiClientGlobalError,
  convertToPlainObject,
} from '~/api';

export const createRepository = async (
  data: Partial<z.infer<typeof RepositorySchema>>,
): Promise<MutationActionResponse<BrandRepository>> => {
  const { error, isAdmin, user } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }

  const parsed = RepositorySchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: ApiClientFormError.fromZodError({ error: parsed.error }).json,
    };
  }

  const { projects: _projects, skills: _skills, ...rest } = parsed.data;

  const fieldErrors = new ApiClientFieldErrors();

  if (await db.repository.count({ where: { slug: rest.slug } })) {
    fieldErrors.addUnique('slug', 'The slug must be unique.');
  }
  if (
    rest.npmPackageName &&
    (await db.repository.count({ where: { npmPackageName: rest.npmPackageName } }))
  ) {
    fieldErrors.addUnique('npmPackageName', 'The npm package name must be unique.');
  }
  const [skills] = await queryM2MsDynamically(db, {
    fieldErrors,
    ids: _skills,
    model: 'skill',
  });
  const [projects] = await queryM2MsDynamically(db, {
    fieldErrors,
    ids: _projects,
    model: 'project',
  });
  if (!fieldErrors.isEmpty) {
    return { error: fieldErrors.json };
  }
  return await db.$transaction(async tx => {
    const repository = await tx.repository.create({
      data: {
        ...rest,
        createdById: user.id,
        projects: projects ? { connect: projects.map(proj => ({ id: proj.id })) } : undefined,
        skills: skills ? { connect: skills.map(skill => ({ slug: skill.slug })) } : undefined,
        updatedById: user.id,
      },
    });
    if (skills && skills.length !== 0) {
      logger.info(
        `Recalculating experience for ${skills.length} skill(s) associated with new repository, ` +
          `'${repository.slug}'.`,
        { repositoryId: repository.id, skills: skills.map(s => s.id) },
      );
      await calculateSkillsExperience(
        tx,
        skills.map(sk => sk.id),
        { user },
      );
      logger.info(
        `Successfully recalculated experience for ${skills.length} skill(s) associated with ` +
          `new repository, '${repository.slug}'.`,
        { repositoryId: repository.id, skills: skills.map(s => s.id) },
      );
    }
    return { data: convertToPlainObject(repository) };
  });
};
