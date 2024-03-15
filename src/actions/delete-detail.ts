"use server";
import { revalidatePath } from "next/cache";

import { getAuthAdminUser } from "~/application/auth";
import { UnreachableCaseError } from "~/application/errors";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { DetailEntityType, type Detail } from "~/prisma/model";
import { ApiClientError } from "~/api";

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

    await tx.nestedDetail.deleteMany({ where: { detailId: detail.id } });
    await tx.detail.delete({ where: { id: detail.id } });

    switch (detail.entityType) {
      case DetailEntityType.EDUCATION: {
        revalidatePath("/admin/educations", "page");
        revalidatePath("/api/educations");
        break;
      }
      case DetailEntityType.EXPERIENCE: {
        revalidatePath("/admin/experiences", "page");
        revalidatePath("/api/experiences");
        break;
      }
      default:
        throw new UnreachableCaseError();
    }
  });
};
