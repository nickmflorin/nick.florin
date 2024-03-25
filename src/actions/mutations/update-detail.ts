"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { UnreachableCaseError } from "~/application/errors";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { DetailEntityType, type Detail } from "~/prisma/model";
import { ApiClientGlobalError, ApiClientFormError, ApiClientFieldErrorCodes } from "~/api";

import { DetailSchema } from "../schemas";

const UpdateDetailSchema = DetailSchema.partial();

export const updateDetail = async (id: string, req: z.infer<typeof UpdateDetailSchema>) => {
  const user = await getAuthAdminUser();

  const parsed = UpdateDetailSchema.safeParse(req);
  if (!parsed.success) {
    throw ApiClientFormError.BadRequest(parsed.error, UpdateDetailSchema);
  }
  let detail: Detail;
  try {
    detail = await prisma.detail.findUniqueOrThrow({
      where: { id },
    });
  } catch (e) {
    if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
      throw ApiClientGlobalError.NotFound();
    }
    throw e;
  }

  const { label, ...data } = parsed.data;
  if (
    label &&
    (await prisma.detail.count({
      where: {
        entityId: detail.entityId,
        entityType: detail.entityType,
        label,
        id: { notIn: [detail.id] },
      },
    }))
  ) {
    return ApiClientFormError.BadRequest({
      label: {
        code: ApiClientFieldErrorCodes.unique,
        message: "The 'label' must be unique for a given parent.",
      },
    }).toJson();
  }
  const updated = await prisma.detail.update({
    where: { id },
    data: {
      ...data,
      label,
      updatedById: user.id,
    },
  });
  switch (detail.entityType) {
    case DetailEntityType.EDUCATION: {
      revalidatePath("/admin/educations", "page");
      revalidatePath("/api/educations");
      return updated;
    }
    case DetailEntityType.EXPERIENCE: {
      revalidatePath("/admin/experiences", "page");
      revalidatePath("/api/experiences");
      return updated;
    }
    default:
      throw new UnreachableCaseError();
  }
};
