"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { ApiClientError, ApiClientFieldErrorCodes } from "~/application/errors";
import { prisma } from "~/prisma/client";
import { DetailEntityType } from "~/prisma/model";

import { getEntity } from "./fetches/get-entity";
import { DetailSchema } from "./schemas";

export const createDetail = async (
  entityId: string,
  entityType: DetailEntityType,
  req: z.infer<typeof DetailSchema>,
) => {
  const user = await getAuthAdminUser();

  const entity = await getEntity(entityId, entityType);
  if (!entity) {
    throw ApiClientError.NotFound("No entity exists for the provided ID and entity type.");
  }

  const parsed = DetailSchema.safeParse(req);
  if (!parsed.success) {
    throw ApiClientError.BadRequest(parsed.error, DetailSchema);
  }
  const { label, ...data } = parsed.data;
  if (
    label &&
    (await prisma.detail.count({
      where: { entityId: entity.id, entityType, label },
    }))
  ) {
    return ApiClientError.BadRequest({
      label: {
        code: ApiClientFieldErrorCodes.unique,
        message: "The 'label' must be unique for a given parent.",
      },
    }).toJson();
  }
  const detail = await prisma.detail.create({
    data: {
      ...data,
      entityId: entity.id,
      entityType,
      label,
      createdById: user.id,
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
  return detail;
};
