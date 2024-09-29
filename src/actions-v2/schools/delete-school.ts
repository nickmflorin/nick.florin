"use server";
import { getAuthedUser } from "~/application/auth/server-v2";
import { db } from "~/database/prisma";

import { type MutationActionResponse } from "~/actions-v2";
import { ApiClientGlobalError } from "~/api-v2";

export const deleteSchool = async (
  id: string,
): Promise<MutationActionResponse<{ message: string }>> => {
  const { error, isAdmin } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }
  const school = await db.school.findUnique({
    where: { id },
    include: { educations: true },
  });
  if (!school) {
    return { error: ApiClientGlobalError.NotFound({}).json };
  } else if (school.educations.length !== 0) {
    throw ApiClientGlobalError.BadRequest({
      message:
        "The school cannot be deleted because it is still associated with " +
        `${school.educations.length} other educations.`,
    });
  }
  await db.school.delete({ where: { id: school.id } });
  return { data: { message: "Success" } };
};
