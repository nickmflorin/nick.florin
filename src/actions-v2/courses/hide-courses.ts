"use server";
import { difference, uniq } from "lodash-es";

import { getAuthedUser } from "~/application/auth/server-v2";
import { db } from "~/database/prisma";
import { logger } from "~/internal/logger";
import { humanizeList } from "~/lib/formatters";
import { isUuid } from "~/lib/typeguards";

import { type MutationActionResponse } from "~/actions-v2";
import { ApiClientGlobalError } from "~/api-v2";

export const hideCourses = async (
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

  const courses = await db.course.findMany({
    where: { id: { in: ids } },
  });
  const invalidIds = difference(
    ids,
    courses.map(s => s.id),
  );
  if (invalidIds.length !== 0) {
    const humanized = humanizeList(invalidIds, { conjunction: "and", formatter: v => `'${v}'` });
    logger.error(`Encountered invalid course ID(s) when hiding courses: ${humanized}.`, {
      ids,
      invalidIds,
    });
    const err = ApiClientGlobalError.BadRequest({
      message: "Request contained course ID(s) that do not exist.",
    });
    return { error: err.json };
  }
  if (courses.some(edu => !edu.visible)) {
    const humanized = humanizeList(
      courses.filter(edu => !edu.visible).map(edu => edu.id),
      { conjunction: "and", formatter: v => `'${v}'` },
    );
    logger.warn(
      `A request to hide courses included course ID(s) ${humanized} associated ` +
        "with courses that are already hidden.",
      { ids: courses.filter(edu => !edu.visible).map(edu => edu.id) },
    );
  }

  await db.course.updateMany({
    where: { id: { in: ids } },
    data: { visible: false, updatedById: user.id },
  });
  return { data: { message: "Success" } };
};
