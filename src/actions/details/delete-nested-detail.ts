"use server";
import { getAuthedUser } from "~/application/auth/server-v2";
import { calculateSkillsExperience } from "~/database/model";
import { db } from "~/database/prisma";

import { type MutationActionResponse } from "~/actions";
import { ApiClientGlobalError } from "~/api";

export const deleteNestedDetail = async (
  id: string,
): Promise<MutationActionResponse<{ message: string }>> => {
  const { error, user, isAdmin } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }
  const detail = await db.nestedDetail.findUnique({
    where: { id },
    include: { detail: true, skills: true },
  });
  if (!detail) {
    return { error: ApiClientGlobalError.NotFound({}).json };
  }
  return await db.$transaction(async tx => {
    const sks = detail.skills.map(sk => sk.id);
    await tx.nestedDetail.delete({ where: { id: detail.id } });
    await calculateSkillsExperience(tx, sks, { user });
    return { data: { message: "Success" } };
  });
};
