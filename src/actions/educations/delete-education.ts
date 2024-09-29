"use server";
import { getAuthedUser } from "~/application/auth/server-v2";
import { calculateSkillsExperience, DetailEntityType } from "~/database/model";
import { db } from "~/database/prisma";
import { logger } from "~/internal/logger";

import { type MutationActionResponse } from "~/actions";
import { ApiClientGlobalError } from "~/api";

export const deleteEducation = async (
  id: string,
): Promise<MutationActionResponse<{ message: string }>> => {
  const { error, user, isAdmin } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }
  const education = await db.education.findUnique({
    where: { id },
    include: { skills: true },
  });
  if (!education) {
    return { error: ApiClientGlobalError.NotFound({}).json };
  }
  return await db.$transaction(async tx => {
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
        `The education being deleted is associated with ${details.length} details, which ` +
          "will also be deleted.",
        { educationId: education.id, details: details.map(d => d.id) },
      );
      const result = await tx.detail.deleteMany({
        where: { entityType: DetailEntityType.EDUCATION, entityId: education.id },
      });
      logger.info(`Deleted ${result.count} details associated with the education being deleted.`, {
        educationId: education.id,
      });
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
        `Deleted ${nestedResult.count} nested details associated with the education ` +
          "being deleted.",
        { educationId: education.id },
      );
    }

    const skillIds = [
      ...education.skills.map(s => s.id),
      ...details.flatMap(d => d.skills.map(s => s.id)),
      ...nestedDetails.flatMap(d => d.skills.map(s => s.id)),
    ];
    await tx.education.delete({ where: { id } });
    await calculateSkillsExperience(tx, skillIds, { user });

    return { data: { message: "Success" } };
  });
};
