"use server";
import { getAuthedUser } from "~/application/auth/server";
import { calculateSkillsExperience } from "~/database/model";
import { db } from "~/database/prisma";

import { ApiClientGlobalError } from "~/api";

export const deleteRepository = async (id: string): Promise<void> => {
  const { user } = await getAuthedUser({ strict: true });

  await db.$transaction(async tx => {
    const repo = await db.repository.findUnique({ where: { id }, include: { skills: true } });
    if (!repo) {
      throw ApiClientGlobalError.NotFound();
    }
    const skillIds = repo.skills.map(s => s.id);
    await tx.repository.delete({ where: { id: repo.id } });
    await calculateSkillsExperience(tx, skillIds, { user });
  });
};
