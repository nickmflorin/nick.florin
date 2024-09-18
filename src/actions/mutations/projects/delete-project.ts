"use server";
import { getAuthedUser } from "~/application/auth/server";
import { calculateSkillsExperience } from "~/database/model";
import { db } from "~/database/prisma";

import { ApiClientGlobalError } from "~/api";

export const deleteProject = async (id: string): Promise<void> => {
  const { user } = await getAuthedUser({ strict: true });

  await db.$transaction(async tx => {
    const project = await db.project.findUnique({ where: { id }, include: { skills: true } });
    if (!project) {
      throw ApiClientGlobalError.NotFound();
    }
    const skillIds = project.skills.map(s => s.id);
    await tx.project.delete({ where: { id: project.id } });
    await calculateSkillsExperience(tx, skillIds, { user });
  });
};
