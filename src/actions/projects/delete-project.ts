'use server';
import { updateTag } from 'next/cache';

import { getAuthedUser } from '~/application/auth/server-v2';
import { calculateSkillsExperience } from '~/database/model';
import { db } from '~/database/prisma';

import { type MutationActionResponse } from '~/actions';
import { ApiClientGlobalError } from '~/api';

import { NavigationProjectsCacheTag } from './get-navigation-projects';

export const deleteProject = async (
  id: string,
): Promise<MutationActionResponse<{ message: string }>> => {
  const { error, isAdmin, user } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }
  const project = await db.project.findUnique({
    include: { skills: true },
    where: { id },
  });
  if (!project) {
    return { error: ApiClientGlobalError.NotFound({}).json };
  }
  return await db.$transaction(async tx => {
    const skillIds = project.skills.map(s => s.id);
    await tx.project.delete({ where: { id: project.id } });
    await calculateSkillsExperience(tx, skillIds, { user });
    updateTag(NavigationProjectsCacheTag);
    return { data: { message: 'Success' } };
  });
};
