"use server";
import { getAuthedUser } from "~/application/auth/server";
import { logger } from "~/internal/logger";
import { prisma } from "~/prisma/client";
import { DetailEntityType, calculateSkillsExperience } from "~/prisma/model";

import { ApiClientGlobalError } from "~/api";

export const deleteExperience = async (id: string): Promise<void> => {
  const { user } = await getAuthedUser({ strict: true });

  await prisma.$transaction(async tx => {
    const experience = await tx.experience.findUnique({
      where: { id },
      include: { skills: true },
    });
    if (!experience) {
      throw ApiClientGlobalError.NotFound();
    }

    const details = await tx.detail.findMany({
      where: { entityType: DetailEntityType.EXPERIENCE, entityId: experience.id },
      include: { nestedDetails: true, skills: true },
    });
    const nestedDetails = await tx.nestedDetail.findMany({
      where: { detailId: { in: details.map(d => d.id) } },
      include: { skills: true },
    });
    if (details.length !== 0) {
      logger.info(
        `The experience being deleted is associated with ${details.length} details, which ` +
          "will also be deleted.",
        { experienceId: experience.id, details: details.map(d => d.id) },
      );
      const result = await tx.detail.deleteMany({
        where: { entityType: DetailEntityType.EXPERIENCE, entityId: experience.id },
      });
      logger.info(`Deleted ${result.count} details associated with the experience being deleted.`, {
        experienceId: experience.id,
      });
    }
    if (nestedDetails.length !== 0) {
      logger.info(
        `The experience being deleted is associated with ${details.length} nested detail(s), which ` +
          "will also be deleted.",
        { experienceId: experience.id, details: details.map(d => d.id) },
      );
      const nestedResult = await tx.nestedDetail.deleteMany({
        where: { detailId: { in: nestedDetails.map(d => d.id) } },
      });
      logger.info(
        `Deleted ${nestedResult.count} nested details associated with the experience ` +
          "being deleted.",
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
  });
};
