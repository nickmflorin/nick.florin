'use server';
import { type z } from 'zod';

import { getAuthedUser } from '~/application/auth/server-v2';
import { type BrandRepository, calculateSkillsExperience } from '~/database/model';
import { db } from '~/database/prisma';

import { type MutationActionResponse } from '~/actions';
import { queryM2MsDynamically } from '~/actions/m2ms';
import { RepositorySchema } from '~/actions/schemas';
import {
  ApiClientFieldErrors,
  ApiClientFormError,
  ApiClientGlobalError,
  convertToPlainObject,
} from '~/api';

const UpdateRepositorySchema = RepositorySchema.partial();

export const updateRepository = async (
  experienceId: string,
  data: z.infer<typeof UpdateRepositorySchema>,
): Promise<MutationActionResponse<BrandRepository>> => {
  const { error, isAdmin, user } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }

  const repository = await db.repository.findUnique({
    include: { skills: true },
    where: { id: experienceId },
  });
  if (!repository) {
    return { error: ApiClientGlobalError.NotFound({}).json };
  }
  const parsed = UpdateRepositorySchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: ApiClientFormError.fromZodError({ error: parsed.error }).json,
    };
  }

  const fieldErrors = new ApiClientFieldErrors();
  const { projects: _projects, skills: _skills, ...rest } = parsed.data;

  if (
    rest.slug &&
    (await db.repository.count({ where: { id: { notIn: [repository.id] }, slug: rest.slug } }))
  ) {
    fieldErrors.addUnique('slug', 'The slug must be unique.');
  }

  if (
    rest.npmPackageName &&
    (await db.repository.count({
      where: { id: { notIn: [repository.id] }, npmPackageName: rest.npmPackageName },
    }))
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

  const sks = [...repository.skills.map(sk => sk.id), ...(skills ?? []).map(sk => sk.id)];

  let updateData = {
    ...rest,
    projects: projects ? { set: projects.map(proj => ({ id: proj.id })) } : undefined,
    skills: skills ? { set: skills.map(skill => ({ id: skill.id })) } : undefined,
    updatedById: user.id,
  };
  if (updateData.visible === false && updateData.highlighted === undefined) {
    updateData = { ...updateData, highlighted: false };
  } else if (updateData.highlighted === true && updateData.visible === undefined) {
    updateData = { ...updateData, visible: true };
  }

  return await db.$transaction(async tx => {
    const updated = await tx.repository.update({
      data: updateData,
      where: { id: repository.id },
    });
    await calculateSkillsExperience(tx, sks, { user });
    return { data: convertToPlainObject(updated) };
  });
};
