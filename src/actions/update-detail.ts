"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { ApiClientError, ApiClientFieldErrorCodes } from "~/application/errors";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { DetailEntityType, type Detail } from "~/prisma/model";

import { ExistingDetailSchema } from "./schemas";

const UpdateDetailSchema = ExistingDetailSchema.partial();

export const updateDetail = async (id: string, req: z.infer<typeof UpdateDetailSchema>) => {
  const user = await getAuthAdminUser();

  const parsed = UpdateDetailSchema.safeParse(req);
  if (!parsed.success) {
    throw ApiClientError.BadRequest(parsed.error, UpdateDetailSchema);
  }
  let detail: Detail;
  try {
    detail = await prisma.detail.findUniqueOrThrow({
      where: { id },
    });
  } catch (e) {
    if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
      throw ApiClientError.NotFound();
    }
    throw e;
  }

  const { label, ...data } = parsed.data;
  if (
    label &&
    (await prisma.detail.count({
      where: { entityId: detail.entityId, entityType: detail.entityType, label },
    }))
  ) {
    return ApiClientError.BadRequest({
      label: {
        code: ApiClientFieldErrorCodes.unique,
        message: "The 'label' must be unique for a given parent.",
      },
    }).toResponse();
  }
  const updated = await prisma.detail.update({
    where: { id },
    data: {
      ...data,
      label,
      updatedById: user.id,
    },
  });
  if (detail.entityType === DetailEntityType.EDUCATION) {
    revalidatePath("/admin/education", "page");
    revalidatePath("/api/educations");
  } else {
    revalidatePath("/admin/experiences", "page");
    revalidatePath("/api/experiences");
  }
  return updated;
};
