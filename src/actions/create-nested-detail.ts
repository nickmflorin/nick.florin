"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { UnreachableCaseError } from "~/application/errors";
import { prisma } from "~/prisma/client";
import { DetailEntityType } from "~/prisma/model";
import { ApiClientError, ApiClientFieldErrorCodes } from "~/api";

import { getDetail } from "./fetches/get-detail";
import { DetailSchema } from "./schemas";

export const createNestedDetail = async (detailId: string, req: z.infer<typeof DetailSchema>) => {
  const user = await getAuthAdminUser();

  const detail = await getDetail(detailId);
  if (!detail) {
    throw ApiClientError.NotFound("No detail exists for the provided ID.");
  }

  const parsed = DetailSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientError.BadRequest(parsed.error, DetailSchema).toJson();
  }
  const { label, ...data } = parsed.data;
  if (
    label &&
    (await prisma.nestedDetail.count({
      where: { detailId, label },
    }))
  ) {
    return ApiClientError.BadRequest({
      label: {
        code: ApiClientFieldErrorCodes.unique,
        message: "The 'label' must be unique for a given parent detail.",
      },
    }).toJson();
  }
  const nestedDetail = await prisma.nestedDetail.create({
    data: {
      ...data,
      detailId,
      label,
      createdById: user.id,
      updatedById: user.id,
    },
  });
  switch (detail.entityType) {
    case DetailEntityType.EDUCATION: {
      revalidatePath("/admin/educations", "page");
      revalidatePath("/api/educations");
      return nestedDetail;
    }
    case DetailEntityType.EXPERIENCE: {
      revalidatePath("/admin/experiences", "page");
      revalidatePath("/api/experiences");
      return nestedDetail;
    }
    default:
      throw new UnreachableCaseError();
  }
};
