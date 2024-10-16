"use server";
import { difference, uniq } from "lodash-es";

import { getAuthedUser } from "~/application/auth/server-v2";
import { db } from "~/database/prisma";
import { logger } from "~/internal/logger";
import { humanizeList } from "~/lib/formatters";
import { isUuid } from "~/lib/typeguards";

import { type MutationActionResponse } from "~/actions";
import { ApiClientGlobalError } from "~/api";

export const hideEducations = async (
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
  });
  const invalidIds = difference(
    ids,
    educations.map(s => s.id),
  );
  if (invalidIds.length !== 0) {
    const humanized = humanizeList(invalidIds, { conjunction: "and", formatter: v => `'${v}'` });
    logger.error(`Encountered invalid education ID(s) when hiding educations: ${humanized}.`, {
      ids,
      invalidIds,
    });
    const err = ApiClientGlobalError.BadRequest({
      message: "Request contained education ID(s) that do not exist.",
    });
    return { error: err.json };
  }
  if (educations.some(edu => !edu.visible)) {
    const humanized = humanizeList(
      educations.filter(edu => !edu.visible).map(edu => edu.id),
      { conjunction: "and", formatter: v => `'${v}'` },
    );
    logger.warn(
      `A request to hide educations included education ID(s) ${humanized} associated ` +
        "with educations that are already hidden.",
      { ids: educations.filter(edu => !edu.visible).map(edu => edu.id) },
    );
  }

  await db.education.updateMany({
    where: { id: { in: ids } },
    data: { visible: false, updatedById: user.id },
  });
  return { data: { message: "Success" } };
};
