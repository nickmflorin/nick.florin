"use server";
import { getAuthedUser } from "~/application/auth/server-v2";
import { db } from "~/database/prisma";

import { type MutationActionResponse } from "~/actions";
import { ApiClientGlobalError } from "~/api";

export const deleteSkill = async (
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
  const skill = await db.skill.findUnique({
    where: { id },
  });
  if (!skill) {
    return { error: ApiClientGlobalError.NotFound({}).json };
  }
  await db.skill.delete({ where: { id: skill.id } });
  return { data: { message: "Success" } };
};
