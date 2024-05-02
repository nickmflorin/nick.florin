"use server";
import { getAuthedUser } from "~/application/auth/server";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { ApiClientGlobalError } from "~/api";

export const deleteRepository = async (id: string): Promise<void> => {
  await getAuthedUser({ strict: true });
  try {
    await prisma.repository.delete({ where: { id } });
  } catch (e) {
    if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
      throw ApiClientGlobalError.NotFound();
    }
    throw e;
  }
};
