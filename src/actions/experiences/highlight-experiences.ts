"use server";
import { difference, uniq } from "lodash-es";

import { getAuthedUser } from "~/application/auth/server-v2";
import { db } from "~/database/prisma";
import { logger } from "~/internal/logger";
import { humanizeList } from "~/lib/formatters";
import { isUuid } from "~/lib/typeguards";

import { type MutationActionResponse } from "~/actions";
import { ApiClientGlobalError } from "~/api";

export const highlightExperiences = async (
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
  });
  const invalidIds = difference(
    ids,
    experiences.map(s => s.id),
  );
  if (invalidIds.length !== 0) {
    const humanized = humanizeList(invalidIds, { conjunction: "and", formatter: v => `'${v}'` });
    logger.error(
      `Encountered invalid experience ID(s) when highlighting experiences: ${humanized}.`,
      { ids, invalidIds },
    );
    const err = ApiClientGlobalError.BadRequest({
      message: "Request contained experience ID(s) that do not exist.",
    });
    return { error: err.json };
  }
  if (experiences.some(exp => exp.highlighted)) {
    const humanized = humanizeList(
      experiences.filter(exp => exp.highlighted).map(exp => exp.id),
      { conjunction: "and", formatter: v => `'${v}'` },
    );
    logger.warn(
      `A request to highlight experiences contained experience ID(s) ${humanized} ` +
        "associated with experiences that are already highlighted.",
      { ids: experiences.filter(exp => exp.highlighted).map(exp => exp.id) },
    );
  }

  await db.experience.updateMany({
    where: { id: { in: ids } },
    data: { highlighted: true, updatedById: user.id },
  });
  return { data: { message: "Success" } };
};
