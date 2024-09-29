"use server";
import { getAuthedUser } from "~/application/auth/server-v2";
import { db } from "~/database/prisma";

import { type MutationActionResponse } from "~/actions";
import { ApiClientGlobalError } from "~/api";

export const deleteCompany = async (
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
  const company = await db.company.findUnique({
    where: { id },
    include: { experiences: true },
  });
  if (!company) {
    return { error: ApiClientGlobalError.NotFound({}).json };
  } else if (company.experiences.length !== 0) {
    throw ApiClientGlobalError.BadRequest({
      message:
        "The company cannot be deleted because it is still associated with " +
        `${company.experiences.length} other educations.`,
    });
  }
  await db.company.delete({ where: { id: company.id } });
  return { data: { message: "Success" } };
};
