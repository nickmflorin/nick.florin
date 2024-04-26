"use server";
import { getAuthAdminUser } from "~/application/auth";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { type NestedDetail, type Detail } from "~/prisma/model";
import { ApiClientGlobalError } from "~/api";

export const deleteNestedDetail = async (id: string) => {
  await getAuthAdminUser();

  return await prisma.$transaction(async tx => {
    let nestedDetail: NestedDetail & { readonly detail: Detail };
    try {
      nestedDetail = await tx.nestedDetail.findUniqueOrThrow({
        where: { id },
        include: { detail: true },
      });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        throw ApiClientGlobalError.NotFound();
      }
      throw e;
    }
    await tx.nestedDetail.delete({ where: { id: nestedDetail.id } });
  });
};
