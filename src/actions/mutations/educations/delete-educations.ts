"use server";
import { getAuthedUser } from "~/application/auth/server";
import { logger } from "~/internal/logger";
import { humanizeList } from "~/lib/formatters";
import { isUuid } from "~/lib/typeguards";
import { prisma } from "~/database/prisma";
import { DetailEntityType, calculateSkillsExperience } from "~/database/model";

import { ApiClientGlobalError } from "~/api";

export const deleteEducations = async (ids: string[]): Promise<void> => {
  const { user } = await getAuthedUser({ strict: true });

  const invalid = ids.filter(id => !isUuid(id));
  if (invalid.length > 0) {
    throw ApiClientGlobalError.BadRequest(
      `The id(s) ${humanizeList(invalid, {
        conjunction: "and",
        formatter: v => `'${v}'`,
      })} are not valid UUID(s).`,
      { invalid },
    );
  }
  await prisma.$transaction(async tx => {
    const educations = await tx.education.findMany({
      where: { id: { in: ids } },
      include: { skills: true },
    });

    const nonexistent = ids.filter(id => !educations.some(e => e.id === id));
    if (nonexistent.length > 0) {
      return ApiClientGlobalError.BadRequest(
        `The id(s) ${humanizeList(nonexistent, {
          conjunction: "and",
          formatter: v => `'${v}'`,
        })} do not exist).`,
        { nonexistent },
      );
    }

    const details = await tx.detail.findMany({
      where: {
        entityType: DetailEntityType.EDUCATION,
        entityId: { in: educations.map(e => e.id) },
      },
      include: { nestedDetails: true, skills: true },
    });
    const nestedDetails = await tx.nestedDetail.findMany({
      where: { detailId: { in: details.map(d => d.id) } },
      include: { skills: true },
    });

    if (details.length !== 0) {
      logger.info(
        `The education(s) being deleted are associated with ${details.length} detail(s), which ` +
          "will also be deleted.",
        { educationIds: educations.map(e => e.id), details: details.map(d => d.id) },
      );
      const result = await tx.detail.deleteMany({
        where: {
          entityType: DetailEntityType.EDUCATION,
          entityId: { in: educations.map(e => e.id) },
        },
      });
      logger.info(
        `Deleted ${result.count} detail(s) associated with the education(s) being deleted.`,
        {
          educationIds: educations.map(e => e.id),
          details: details.map(d => d.id),
        },
      );
    }
    if (nestedDetails.length !== 0) {
      logger.info(
        `The education(s) being deleted are associated with ${details.length} nested detail(s), which ` +
          "will also be deleted.",
        { educationIds: educations.map(e => e.id), nestedDetails: nestedDetails.map(d => d.id) },
      );
      const nestedResult = await tx.nestedDetail.deleteMany({
        where: { detailId: { in: nestedDetails.map(d => d.id) } },
      });
      logger.info(
        `Deleted ${nestedResult.count} nested detail(s) associated with the education(s) ` +
          "being deleted.",
        { educationIds: educations.map(e => e.id) },
      );
    }

    const skillIds = [
      ...educations.flatMap(({ skills }) => skills.map(s => s.id)),
      ...details.flatMap(d => d.skills.map(s => s.id)),
      ...nestedDetails.flatMap(d => d.skills.map(s => s.id)),
    ];
    await tx.education.deleteMany({ where: { id: { in: ids } } });
    await calculateSkillsExperience(tx, skillIds, { user });
  });
};
