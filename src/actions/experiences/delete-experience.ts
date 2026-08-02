'use server';
import { getAuthedUser } from '~/application/auth/server-v2';
import { calculateSkillsExperience, DetailEntityType } from '~/database/model';
import { db } from '~/database/prisma';
import { logger } from '~/internal/logger';

import { type MutationActionResponse } from '~/actions';
import { ApiClientGlobalError } from '~/api';

export const deleteExperience = async (
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
  const experience = await db.experience.findUnique({
    include: { skills: true },
    where: { id },
  });
  if (!experience) {
    return { error: ApiClientGlobalError.NotFound({}).json };
  }
  return await db.$transaction(async tx => {
    const details = await tx.detail.findMany({
      include: { nestedDetails: true, skills: true },
      where: { entityId: experience.id, entityType: DetailEntityType.EXPERIENCE },
    });
    const nestedDetails = await tx.nestedDetail.findMany({
      include: { skills: true },
      where: { detailId: { in: details.map(d => d.id) } },
    });
    if (details.length !== 0) {
      logger.info(
        `The experience being deleted is associated with ${details.length} details, which ` +
          'will also be deleted.',
        { details: details.map(d => d.id), experienceId: experience.id },
      );
      const result = await tx.detail.deleteMany({
        where: { entityId: experience.id, entityType: DetailEntityType.EXPERIENCE },
      });
      logger.info(`Deleted ${result.count} details associated with the experience being deleted.`, {
        experienceId: experience.id,
      });
    }
    if (nestedDetails.length !== 0) {
      logger.info(
        `The experience being deleted is associated with ${details.length} nested detail(s), ` +
          'which will also be deleted.',
        { details: details.map(d => d.id), experienceId: experience.id },
      );
      const nestedResult = await tx.nestedDetail.deleteMany({
        where: { detailId: { in: nestedDetails.map(d => d.id) } },
      });
      logger.info(
        `Deleted ${nestedResult.count} nested details associated with the experience ` +
          'being deleted.',
        { experienceId: experience.id },
      );
    }

    const skillIds = [
      ...experience.skills.map(s => s.id),
      ...details.flatMap(d => d.skills.map(s => s.id)),
      ...nestedDetails.flatMap(d => d.skills.map(s => s.id)),
    ];
    await tx.experience.delete({ where: { id } });
    await calculateSkillsExperience(tx, skillIds, { user });

    return { data: { message: 'Success' } };
  });
};
