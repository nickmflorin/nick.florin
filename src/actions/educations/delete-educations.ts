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

export const deleteEducations = async (
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

  const educations = await db.education.findMany({
    where: { id: { in: ids } },
    include: { skills: true },
  });
  const invalidIds = difference(
    ids,
    educations.map(s => s.id),
  );
  if (invalidIds.length !== 0) {
    const humanized = humanizeList(invalidIds, { conjunction: "and", formatter: v => `'${v}'` });
    logger.error(`Encountered invalid education ID(s) when deleting educations: ${humanized}.`, {
      ids,
      invalidIds,
    });
    const err = ApiClientGlobalError.BadRequest({
      message: "Request contained education ID(s) that do not exist.",
    });
    return { error: err.json };
  }
  return await db.$transaction(async tx => {
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
        `The education(s) being deleted are associated with ${details.length} nested ` +
          "detail(s), which will also be deleted.",
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
    return { data: { message: "Success" } };
  });
};
