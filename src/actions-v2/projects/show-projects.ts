"use server";
import { difference, uniq } from "lodash-es";

import { getAuthedUser } from "~/application/auth/server-v2";
import { db } from "~/database/prisma";
import { logger } from "~/internal/logger";
import { humanizeList } from "~/lib/formatters";
import { isUuid } from "~/lib/typeguards";

import { type MutationActionResponse } from "~/actions-v2";
import { ApiClientGlobalError } from "~/api-v2";

export const showProjects = async (
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
  const projects = await db.project.findMany({
    where: { id: { in: ids } },
  });
  const invalidIds = difference(
    ids,
    projects.map(s => s.id),
  );
  if (invalidIds.length !== 0) {
    const humanized = humanizeList(invalidIds, { conjunction: "and", formatter: v => `'${v}'` });
    logger.error(`Encountered invalid project ID(s) when showing projects: ${humanized}.`, {
      ids,
      invalidIds,
    });
    const err = ApiClientGlobalError.BadRequest({
      message: "Request contained project ID(s) that do not exist.",
    });
    return { error: err.json };
  }
  if (projects.some(proj => proj.visible)) {
    const humanized = humanizeList(
      projects.filter(proj => proj.visible).map(proj => proj.id),
      { conjunction: "and", formatter: v => `'${v}'` },
    );
    logger.warn(
      `A request to show projects included project ID(s) ${humanized} associated ` +
        "with projects that are already visible.",
      { ids: projects.filter(proj => proj.visible).map(proj => proj.id) },
    );
  }
  await db.project.updateMany({
    where: { id: { in: ids } },
    data: { visible: true, updatedById: user.id },
  });
  return { data: { message: "Success" } };
};
