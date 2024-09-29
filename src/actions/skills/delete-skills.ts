"use server";
import { difference, uniq } from "lodash-es";

import { getAuthedUser } from "~/application/auth/server-v2";
import { db } from "~/database/prisma";
import { logger } from "~/internal/logger";
import { humanizeList } from "~/lib/formatters";
import { isUuid } from "~/lib/typeguards";

import { type MutationActionResponse } from "~/actions";
import { ApiClientGlobalError } from "~/api";

export const deleteSkills = async (
  _ids: string[],
): Promise<MutationActionResponse<{ message: string }>> => {
  const { error, isAdmin } = await getAuthedUser();
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

  const skills = await db.skill.findMany({
    where: { id: { in: ids } },
  });
  const invalidIds = difference(
    ids,
    skills.map(s => s.id),
  );
  if (invalidIds.length !== 0) {
    const humanized = humanizeList(invalidIds, { conjunction: "and", formatter: v => `'${v}'` });
    logger.error(`Encountered invalid skill ID(s) when deleting skills: ${humanized}.`, {
      ids,
      invalidIds,
    });
    const err = ApiClientGlobalError.BadRequest({
      message: "Request contained skill ID(s) that do not exist.",
    });
    return { error: err.json };
  }
  await db.skill.deleteMany({ where: { id: { in: ids } } });
  return { data: { message: "Success" } };
};
