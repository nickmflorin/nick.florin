"use server";
import { revalidatePath } from "next/cache";

import { getAuthAdminUser } from "~/application/auth";
import { ApiClientError } from "~/application/errors";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { DetailEntityType, type Detail } from "~/prisma/model";

export const deleteDetail = async (id: string) => {
  await getAuthAdminUser();

  return await prisma.$transaction(async tx => {
    let detail: Detail;
    try {
      detail = await tx.detail.findUniqueOrThrow({
        where: { id },
      });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        throw ApiClientError.NotFound();
      }
      throw e;
    }
    await tx.detail.delete({ where: { id: detail.id } });

    if (detail.entityType === DetailEntityType.EDUCATION) {
      revalidatePath("/admin/education", "page");
      revalidatePath("/api/educations");
    } else {
      revalidatePath("/admin/experiences", "page");
      revalidatePath("/api/experiences");
    }
  });
};
