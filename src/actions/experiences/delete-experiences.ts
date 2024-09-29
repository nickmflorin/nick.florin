"use server";
import { difference, uniq } from "lodash-es";

import { getAuthedUser } from "~/application/auth/server-v2";
import { calculateSkillsExperience, DetailEntityType } from "~/database/model";
import { db } from "~/database/prisma";
import { logger } from "~/internal/logger";
import { humanizeList } from "~/lib/formatters";
import { isUuid } from "~/lib/typeguards";

import { type MutationActionResponse } from "~/actions";
import { ApiClientGlobalError } from "~/api";

export const deleteExperiences = async (
  _ids: string[],
): Promise<MutationActionResponse<{ message: string }>> => {
  const { error, user, isAdmin } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }

  const ids = uniq(_ids);

  const invalidUUIDs = ids.filter(id => !isUuid(id));
  if (invalidUUIDs.length > 0) {
    const err = ApiClientGlobalError.BadRequest({
      message: `The id(s) ${humanizeList(invalidUUIDs, {
        conjunction: "and",
        formatter: v => `'${v}'`,
      })} are not valid UUID(s).`,
    });
    return { error: err.json };
  }

  const experiences = await db.experience.findMany({
    where: { id: { in: ids } },
    include: { skills: true },
  });
  const invalidIds = difference(
    ids,
    experiences.map(s => s.id),
  );
  if (invalidIds.length !== 0) {
    const humanized = humanizeList(invalidIds, { conjunction: "and", formatter: v => `'${v}'` });
    logger.error(`Encountered invalid experience ID(s) when deleting experiences: ${humanized}.`, {
      ids,
      invalidIds,
    });
    const err = ApiClientGlobalError.BadRequest({
      message: "Request contained experience ID(s) that do not exist.",
    });
    return { error: err.json };
  }
  return await db.$transaction(async tx => {
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
    return { data: { message: "Success" } };
  });
};
