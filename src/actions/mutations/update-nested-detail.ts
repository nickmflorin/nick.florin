"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { UnreachableCaseError } from "~/application/errors";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { DetailEntityType, type NestedDetail, type Detail, type Project } from "~/prisma/model";
import {
  ApiClientFieldErrors,
  ApiClientFormError,
  ApiClientFieldErrorCodes,
  ApiClientGlobalError,
} from "~/api";
import { DetailSchema } from "~/api/schemas";

const UpdateDetailSchema = DetailSchema.partial();

export const updateNestedDetail = async (id: string, req: z.infer<typeof UpdateDetailSchema>) => {
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

  const { label, project: _project, ...data } = parsed.data;

  const fieldErrors = new ApiClientFieldErrors();

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
      where: {
        detailId: nestedDetail.detail.id,
        label,
        id: { notIn: [nestedDetail.id] },
      },
    }))
  ) {
    fieldErrors.add("label", {
      code: ApiClientFieldErrorCodes.unique,
      message: "The 'label' must be unique for a given parent.",
    });
  }

  if (!fieldErrors.isEmpty) {
    return fieldErrors.toError().toResponse();
  }

  const updated = await prisma.nestedDetail.update({
    where: { id },
    data: {
      ...data,
      projectId: project?.id,
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
