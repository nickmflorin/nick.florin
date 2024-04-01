"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { UnreachableCaseError } from "~/application/errors";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { DetailEntityType, type Detail, type Project } from "~/prisma/model";
import { ApiClientFieldErrors, ApiClientGlobalError } from "~/api";
import { DetailSchema } from "~/api/schemas";

const UpdateDetailSchema = DetailSchema.partial();

export const updateDetail = async (id: string, req: z.infer<typeof UpdateDetailSchema>) => {
  const user = await getAuthAdminUser();

  const parsed = UpdateDetailSchema.safeParse(req);
  if (!parsed.success) {
    throw ApiClientFieldErrors.fromZodError(parsed.error, UpdateDetailSchema).error;
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

  const { label, project: _project, ...data } = parsed.data;

  const fieldErrors = new ApiClientFieldErrors();

  let project: Project | null = null;
  if (_project) {
    try {
      project = await prisma.project.findUniqueOrThrow({ where: { id: _project } });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        fieldErrors.addDoesNotExist("project", {
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
    (await prisma.detail.count({
      where: {
        entityId: detail.entityId,
        entityType: detail.entityType,
        label,
        id: { notIn: [detail.id] },
      },
    }))
  ) {
    fieldErrors.addUnique("label", "The 'label' must be unique for a given parent.");
  }

  if (!fieldErrors.isEmpty) {
    return fieldErrors.json;
  }

  const updated = await prisma.detail.update({
    where: { id },
    data: {
      ...data,
      projectId: project?.id,
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
