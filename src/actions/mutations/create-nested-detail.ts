"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { UnreachableCaseError } from "~/application/errors";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { DetailEntityType, type NestedApiDetail, type Project } from "~/prisma/model";
import {
  ApiClientFieldErrors,
  ApiClientFormError,
  ApiClientGlobalError,
  ApiClientFieldErrorCodes,
  type ApiClientErrorJson,
} from "~/api";
import { DetailSchema } from "~/api/schemas";

import { getDetail } from "../fetches/get-detail";

export const createNestedDetail = async (
  detailId: string,
  req: z.infer<typeof DetailSchema>,
): Promise<NestedApiDetail | ApiClientErrorJson> => {
  const user = await getAuthAdminUser();

  const detail = await getDetail(detailId);
  if (!detail) {
    throw ApiClientGlobalError.NotFound("No detail exists for the provided ID.");
  }

  const parsed = DetailSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFormError.BadRequest(parsed.error, DetailSchema).toJson();
  }

  const fieldErrors = new ApiClientFieldErrors();

  const { label, project: _project, ...data } = parsed.data;

  let project: Project | null = null;
  if (_project) {
    try {
      project = await prisma.project.findUniqueOrThrow({ where: { id: _project } });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        fieldErrors.add("project", {
          code: "does_not_exist",
          message: "The project does not exist.",
          internalMessage: `The project with ID '${_project}' does not exist.`,
        });
      } else {
        throw e;
      }
    }
  }
  if (
    label &&
    (await prisma.nestedDetail.count({
      where: { detailId, label },
    }))
  ) {
    fieldErrors.add("label", {
      code: ApiClientFieldErrorCodes.unique,
      message: "The 'label' must be unique for a given parent detail.",
    });
  }
  if (!fieldErrors.isEmpty) {
    return fieldErrors.toError().toJson();
  }
  const nestedDetail = await prisma.nestedDetail.create({
    data: {
      ...data,
      detailId,
      projectId: project?.id,
      label,
      createdById: user.id,
      updatedById: user.id,
    },
    include: { project: true },
  });
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
  return nestedDetail;
};
