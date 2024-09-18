"use server";
import { getAuthedUser } from "~/application/auth/server";
import { calculateSkillsExperience } from "~/database/model";
import { db } from "~/database/prisma";

import { ApiClientGlobalError } from "~/api";

export const deleteNestedDetail = async (id: string) => {
  const { user } = await getAuthedUser();

  return await db.$transaction(async tx => {
    const nestedDetail = await tx.nestedDetail.findUnique({
      where: { id },
      include: { detail: true, skills: true },
    });
    if (!nestedDetail) {
      throw ApiClientGlobalError.NotFound();
    }
    const sks = nestedDetail.skills.map(sk => sk.id);
    await tx.nestedDetail.delete({ where: { id: nestedDetail.id } });
    await calculateSkillsExperience(tx, sks, { user });
  });
};
