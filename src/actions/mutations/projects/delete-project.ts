"use server";
import { getAuthedUser } from "~/application/auth/server";
import { prisma } from "~/prisma/client";
import { calculateSkillsExperience } from "~/prisma/model";

import { ApiClientGlobalError } from "~/api";

export const deleteProject = async (id: string): Promise<void> => {
  const { user } = await getAuthedUser({ strict: true });

  await prisma.$transaction(async tx => {
    const project = await prisma.project.findUnique({ where: { id }, include: { skills: true } });
    if (!project) {
      throw ApiClientGlobalError.NotFound();
    }
    const skillIds = project.skills.map(s => s.id);
    await tx.project.delete({ where: { id: project.id } });
    await calculateSkillsExperience(tx, skillIds, { user });
  });
};
