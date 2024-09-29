"use server";
import { getAuthedUser } from "~/application/auth/server-v2";
import { calculateSkillsExperience } from "~/database/model";
import { db } from "~/database/prisma";

import { type MutationActionResponse } from "~/actions";
import { ApiClientGlobalError } from "~/api";

export const deleteProject = async (
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
  const project = await db.project.findUnique({
    where: { id },
    include: { skills: true },
  });
  if (!project) {
    return { error: ApiClientGlobalError.NotFound({}).json };
  }
  return await db.$transaction(async tx => {
    const skillIds = project.skills.map(s => s.id);
    await tx.project.delete({ where: { id: project.id } });
    await calculateSkillsExperience(tx, skillIds, { user });
    return { data: { message: "Success" } };
  });
};
