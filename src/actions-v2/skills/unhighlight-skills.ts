"use server";
import { difference, uniq } from "lodash-es";

import { getAuthedUser } from "~/application/auth/server-v2";
import { db } from "~/database/prisma";
import { logger } from "~/internal/logger";
import { humanizeList } from "~/lib/formatters";
import { isUuid } from "~/lib/typeguards";

import { type MutationActionResponse } from "~/actions-v2";
import { ApiClientGlobalError } from "~/api-v2";

export const unhighlightSkills = async (
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

  const skills = await db.skill.findMany({
    where: { id: { in: ids } },
  });
  const invalidIds = difference(
    ids,
    skills.map(s => s.id),
  );
  if (invalidIds.length !== 0) {
    const humanized = humanizeList(invalidIds, { conjunction: "and", formatter: v => `'${v}'` });
    logger.error(`Encountered invalid skill ID(s) when unhighlighting skills: ${humanized}.`, {
      ids,
      invalidIds,
    });
    const err = ApiClientGlobalError.BadRequest({
      message: "Request contained skill ID(s) that do not exist.",
    });
    return { error: err.json };
  }
  if (skills.some(sk => !sk.highlighted)) {
    const humanized = humanizeList(
      skills.filter(sk => !sk.highlighted).map(sk => sk.id),
      { conjunction: "and", formatter: v => `'${v}'` },
    );
    logger.warn(
      `A request to unhighlight skills contained skill ID(s) ${humanized} associated with ` +
        "skills that are already unhighlighted.",
      { ids: skills.filter(sk => !sk.highlighted).map(sk => sk.id) },
    );
  }

  await db.skill.updateMany({
    where: { id: { in: ids } },
    data: { highlighted: false, updatedById: user.id },
  });
  return { data: { message: "Success" } };
};
