"use server";
import { difference, uniq } from "lodash-es";

import { getAuthedUser } from "~/application/auth/server-v2";
import { db } from "~/database/prisma";
import { logger } from "~/internal/logger";
import { humanizeList } from "~/lib/formatters";
import { isUuid } from "~/lib/typeguards";

import { type MutationActionResponse } from "~/actions";
import { ApiClientGlobalError } from "~/api";

export const showRepositories = async (
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
  const repositories = await db.repository.findMany({
    where: { id: { in: ids } },
  });
  const invalidIds = difference(
    ids,
    repositories.map(s => s.id),
  );
  if (invalidIds.length !== 0) {
    const humanized = humanizeList(invalidIds, { conjunction: "and", formatter: v => `'${v}'` });
    logger.error(`Encountered invalid repository ID(s) when showing repositories: ${humanized}.`, {
      ids,
      invalidIds,
    });
    const err = ApiClientGlobalError.BadRequest({
      message: "Request contained repository ID(s) that do not exist.",
    });
    return { error: err.json };
  }
  if (repositories.some(proj => proj.visible)) {
    const humanized = humanizeList(
      repositories.filter(proj => proj.visible).map(proj => proj.id),
      { conjunction: "and", formatter: v => `'${v}'` },
    );
    logger.warn(
      `A request to show repositories included repository ID(s) ${humanized} associated ` +
        "with repositories that are already visible.",
      { ids: repositories.filter(proj => proj.visible).map(proj => proj.id) },
    );
  }
  await db.repository.updateMany({
    where: { id: { in: ids } },
    data: { visible: true, updatedById: user.id },
  });
  return { data: { message: "Success" } };
};
