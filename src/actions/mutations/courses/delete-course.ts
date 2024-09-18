"use server";
import { getAuthedUser } from "~/application/auth/server";
import { calculateSkillsExperience } from "~/database/model";
import { db } from "~/database/prisma";

import { ApiClientGlobalError } from "~/api";

export const deleteCourse = async (id: string): Promise<void> => {
  const { user } = await getAuthedUser({ strict: true });

  await db.$transaction(async tx => {
    const course = await db.course.findUnique({ where: { id }, include: { skills: true } });
    if (!course) {
      throw ApiClientGlobalError.NotFound();
    }
    const skillIds = course.skills.map(s => s.id);
    await tx.course.delete({ where: { id: course.id } });
    await calculateSkillsExperience(tx, skillIds, { user });
  });
};
