"use server";
import { getAuthAdminUser } from "~/application/auth";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { ApiClientGlobalError } from "~/api";

export const deleteSkill = async (id: string): Promise<void> => {
  await getAuthAdminUser({ strict: true });
  try {
    await prisma.skill.delete({ where: { id } });
  } catch (e) {
    if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
      throw ApiClientGlobalError.NotFound();
    }
    throw e;
  }
};
