"use server";
import { getAuthAdminUser } from "~/application/auth";
import { prisma } from "~/prisma/client";

export const deleteExperience = async (id: string): Promise<void> => {
  /* Note: We may want to return the error in the response body in the future, for now this is
     fine - since it is not expected. */
  const user = await getAuthAdminUser();

  await prisma.$transaction(async tx => {
    await tx.experience.delete({ where: { id } });
  });
};
