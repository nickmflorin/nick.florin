"use server";
import { getAuthedUser } from "~/application/auth/server";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { type Detail } from "~/prisma/model";
import { ApiClientGlobalError } from "~/api";

export const deleteDetail = async (id: string) => {
  await getAuthedUser();

  return await prisma.$transaction(async tx => {
    let detail: Detail;
    try {
      detail = await tx.detail.findUniqueOrThrow({
        where: { id },
      });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        throw ApiClientGlobalError.NotFound();
      }
      throw e;
    }

    await tx.nestedDetail.deleteMany({ where: { detailId: detail.id } });
    await tx.detail.delete({ where: { id: detail.id } });
  });
};
