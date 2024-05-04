"use server";
import { getAuthedUser } from "~/application/auth/server";
import { prisma } from "~/prisma/client";
import { calculateSkillsExperience } from "~/prisma/model";
import { ApiClientGlobalError } from "~/api";

export const deleteDetail = async (id: string) => {
  const { user } = await getAuthedUser();

  return await prisma.$transaction(async tx => {
    const detail = await tx.detail.findUnique({
      where: { id },
      include: { skills: true, nestedDetails: { include: { skills: true } } },
    });
    if (!detail) {
      throw ApiClientGlobalError.NotFound();
    }
    const sks = [
      ...detail.skills.map(s => s.id),
      ...detail.nestedDetails.flatMap(d => d.skills.map(s => s.id)),
    ];
    await tx.nestedDetail.deleteMany({ where: { detailId: detail.id } });
    await tx.detail.delete({ where: { id: detail.id } });
    await calculateSkillsExperience(tx, sks, { user });
  });
};
