"use server";
import { getAuthedUser } from "~/application/auth/server-v2";
import { calculateSkillsExperience } from "~/database/model";
import { db } from "~/database/prisma";

import { type MutationActionResponse } from "~/actions";
import { ApiClientGlobalError } from "~/api";

export const deleteCourse = async (
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
  const course = await db.course.findUnique({
    where: { id },
    include: { skills: true },
  });
  if (!course) {
    return { error: ApiClientGlobalError.NotFound({}).json };
  }
  return await db.$transaction(async tx => {
    const skillIds = course.skills.map(s => s.id);
    await tx.course.delete({ where: { id: course.id } });
    await calculateSkillsExperience(tx, skillIds, { user, persist: true });
    return { data: { message: "Success" } };
  });
};
