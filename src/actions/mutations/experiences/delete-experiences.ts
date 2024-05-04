"use server";
import { getAuthedUser } from "~/application/auth/server";
import { logger } from "~/application/logger";
import { humanizeList } from "~/lib/formatters";
import { isUuid } from "~/lib/typeguards";
import { prisma } from "~/prisma/client";
import { DetailEntityType, calculateSkillsExperience } from "~/prisma/model";
import { ApiClientGlobalError } from "~/api";

export const deleteExperiences = async (ids: string[]): Promise<void> => {
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
    const experiences = await tx.experience.findMany({
      where: { id: { in: ids } },
      include: { skills: true },
    });

    const nonexistent = ids.filter(id => !experiences.some(e => e.id === id));
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
        entityType: DetailEntityType.EXPERIENCE,
        entityId: { in: experiences.map(e => e.id) },
      },
      include: { nestedDetails: true, skills: true },
    });
    const nestedDetails = await tx.nestedDetail.findMany({
      where: { detailId: { in: details.map(d => d.id) } },
      include: { skills: true },
    });

    if (details.length !== 0) {
      logger.info(
        `The experience(s) being deleted are associated with ${details.length} detail(s), which ` +
          "will also be deleted.",
        { experienceIds: experiences.map(e => e.id), details: details.map(d => d.id) },
      );
      const result = await tx.detail.deleteMany({
        where: {
          entityType: DetailEntityType.EXPERIENCE,
          entityId: { in: experiences.map(e => e.id) },
        },
      });
      logger.info(
        `Deleted ${result.count} detail(s) associated with the experience(s) being deleted.`,
        {
          experienceIds: experiences.map(e => e.id),
          details: details.map(d => d.id),
        },
      );
    }
    if (nestedDetails.length !== 0) {
      logger.info(
        `The experience(s) being deleted are associated with ${details.length} nested ` +
          "detail(s), which will also be deleted.",
        { experienceIds: experiences.map(e => e.id), nestedDetails: nestedDetails.map(d => d.id) },
      );
      const nestedResult = await tx.nestedDetail.deleteMany({
        where: { detailId: { in: nestedDetails.map(d => d.id) } },
      });
      logger.info(
        `Deleted ${nestedResult.count} nested detail(s) associated with the experience(s) ` +
          "being deleted.",
        { experienceIds: experiences.map(e => e.id) },
      );
    }

    const skillIds = [
      ...experiences.flatMap(({ skills }) => skills.map(s => s.id)),
      ...details.flatMap(d => d.skills.map(s => s.id)),
      ...nestedDetails.flatMap(d => d.skills.map(s => s.id)),
    ];
    await tx.experience.deleteMany({ where: { id: { in: ids } } });
    await calculateSkillsExperience(tx, skillIds, { user });
  });
};
