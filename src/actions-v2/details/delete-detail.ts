"use server";
import { getAuthedUser } from "~/application/auth/server-v2";
import { calculateSkillsExperience } from "~/database/model";
import { db } from "~/database/prisma";

import { type MutationActionResponse } from "~/actions-v2";
import { ApiClientGlobalError } from "~/api-v2";

export const deleteDetail = async (
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
  const detail = await db.detail.findUnique({
    where: { id },
    include: { skills: true, nestedDetails: { include: { skills: true } } },
  });
  if (!detail) {
    return { error: ApiClientGlobalError.NotFound({}).json };
  }
  return await db.$transaction(async tx => {
    const sks = [
      ...detail.skills.map(s => s.id),
      ...detail.nestedDetails.flatMap(d => d.skills.map(s => s.id)),
    ];
    await tx.nestedDetail.deleteMany({ where: { detailId: detail.id } });
    await tx.detail.delete({ where: { id: detail.id } });
    await calculateSkillsExperience(tx, sks, { user });
    return { data: { message: "Success" } };
  });
};
