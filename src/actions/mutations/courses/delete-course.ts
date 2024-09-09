"use server";
import { getAuthedUser } from "~/application/auth/server";
import { prisma } from "~/prisma/client";
import { calculateSkillsExperience } from "~/prisma/model";

import { ApiClientGlobalError } from "~/api";

export const deleteCourse = async (id: string): Promise<void> => {
  const { user } = await getAuthedUser({ strict: true });

  await prisma.$transaction(async tx => {
    const course = await prisma.course.findUnique({ where: { id }, include: { skills: true } });
    if (!course) {
      throw ApiClientGlobalError.NotFound();
    }
    const skillIds = course.skills.map(s => s.id);
    await tx.course.delete({ where: { id: course.id } });
    await calculateSkillsExperience(tx, skillIds, { user });
  });
};
