"use server";
import { getAuthedUser } from "~/application/auth/server";
import { prisma } from "~/prisma/client";
import { calculateSkillsExperience } from "~/prisma/model";
import { ApiClientGlobalError } from "~/api";

export const deleteRepository = async (id: string): Promise<void> => {
  const { user } = await getAuthedUser({ strict: true });

  await prisma.$transaction(async tx => {
    const repo = await prisma.repository.findUnique({ where: { id }, include: { skills: true } });
    if (!repo) {
      throw ApiClientGlobalError.NotFound();
    }
    const skillIds = repo.skills.map(s => s.id);
    await tx.repository.delete({ where: { id: repo.id } });
    await calculateSkillsExperience(tx, skillIds, { user });
  });
};
