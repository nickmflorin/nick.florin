"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { UnreachableCaseError } from "~/application/errors";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { DetailEntityType, type NestedDetail, type Detail } from "~/prisma/model";
import {
  ApiClientFormError,
  ApiClientFieldErrorCodes,
  ApiClientGlobalError,
  type ApiClientFormErrorJson,
} from "~/api";

import { DetailSchema } from "../schemas";

const UpdateDetailSchema = DetailSchema.partial();

export const updateNestedDetail = async (
  id: string,
  req: z.infer<typeof UpdateDetailSchema>,
): Promise<NestedDetail | ApiClientFormErrorJson> => {
  const user = await getAuthAdminUser();

  const parsed = UpdateDetailSchema.safeParse(req);
  if (!parsed.success) {
    throw ApiClientFormError.BadRequest(parsed.error, UpdateDetailSchema);
  }
  let nestedDetail: NestedDetail & { readonly detail: Detail };
  try {
    nestedDetail = await prisma.nestedDetail.findUniqueOrThrow({
      where: { id },
      include: { detail: true },
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
    (await prisma.nestedDetail.count({
      where: {
        detailId: nestedDetail.detail.id,
        label,
        id: { notIn: [nestedDetail.id] },
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
  const updated = await prisma.nestedDetail.update({
    where: { id },
    data: {
      ...data,
      label,
      updatedById: user.id,
    },
  });
  switch (nestedDetail.detail.entityType) {
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
