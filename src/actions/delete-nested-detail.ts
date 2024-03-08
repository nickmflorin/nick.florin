"use server";
import { revalidatePath } from "next/cache";

import { getAuthAdminUser } from "~/application/auth";
import { ApiClientError, UnreachableCaseError } from "~/application/errors";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { DetailEntityType, type NestedDetail, type Detail } from "~/prisma/model";

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
        throw ApiClientError.NotFound();
      }
      throw e;
    }
    await tx.nestedDetail.delete({ where: { id: nestedDetail.id } });

    switch (nestedDetail.detail.entityType) {
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
