"use server";
import { getAuthedUser } from "~/application/auth/server";
import { DetailEntityType, calculateSkillsExperience } from "~/database/model";
import { db } from "~/database/prisma";
import { logger } from "~/internal/logger";

import { ApiClientGlobalError } from "~/api";

export const deleteEducation = async (id: string): Promise<void> => {
  const { user } = await getAuthedUser({ strict: true });

  await db.$transaction(async tx => {
    const education = await tx.education.findUnique({
      where: { id },
      include: { skills: true },
    });
    if (!education) {
      throw ApiClientGlobalError.NotFound();
    }

    const details = await tx.detail.findMany({
      where: { entityType: DetailEntityType.EDUCATION, entityId: education.id },
      include: { nestedDetails: true, skills: true },
    });
    const nestedDetails = await tx.nestedDetail.findMany({
      where: { detailId: { in: details.map(d => d.id) } },
      include: { skills: true },
    });
    if (details.length !== 0) {
      logger.info(
        `The education being deleted is associated with ${details.length} detail(s), which ` +
          "will also be deleted.",
        { educationId: education.id, details: details.map(d => d.id) },
      );
      const result = await tx.detail.deleteMany({
        where: { entityType: DetailEntityType.EDUCATION, entityId: education.id },
      });
      logger.info(
        `Deleted ${result.count} detail(s) associated with the education being deleted.`,
        {
          educationId: education.id,
        },
      );
    }
    if (nestedDetails.length !== 0) {
      logger.info(
        `The education being deleted is associated with ${details.length} nested detail(s), which ` +
          "will also be deleted.",
        { educationId: education.id, details: details.map(d => d.id) },
      );
      const nestedResult = await tx.nestedDetail.deleteMany({
        where: { detailId: { in: nestedDetails.map(d => d.id) } },
      });
      logger.info(
        `Deleted ${nestedResult.count} nested detail(s) associated with the education ` +
          "being deleted.",
        { educationId: education.id },
      );
    }

    const { count } = await tx.course.deleteMany({ where: { educationId: education.id } });
    logger.info(`Deletd ${count} course(s) associated with the education being deleted.`, {
      educationId: education.id,
    });

    const skillIds = [
      ...education.skills.map(s => s.id),
      ...details.flatMap(d => d.skills.map(s => s.id)),
      ...nestedDetails.flatMap(d => d.skills.map(s => s.id)),
    ];
    await tx.education.delete({ where: { id } });
    await calculateSkillsExperience(tx, skillIds, { user });
  });
};
