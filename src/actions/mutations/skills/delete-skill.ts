"use server";
import { getAuthedUser } from "~/application/auth/server";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/database/prisma";

import { ApiClientGlobalError } from "~/api";

export const deleteSkill = async (id: string): Promise<void> => {
  await getAuthedUser({ strict: true });
  try {
    await prisma.skill.delete({ where: { id } });
  } catch (e) {
    if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
      throw ApiClientGlobalError.NotFound();
    }
    throw e;
  }
};
