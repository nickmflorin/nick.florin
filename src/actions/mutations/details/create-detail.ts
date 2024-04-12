"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { UnreachableCaseError } from "~/application/errors";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { DetailEntityType, type Project, type ApiDetail } from "~/prisma/model";
import { getEntity } from "~/actions/fetches/get-entity";
import { ApiClientFieldErrors } from "~/api";
import { ApiClientGlobalError, type ApiClientErrorJson } from "~/api";
import { DetailSchema } from "~/api/schemas";
import { convertToPlainObject } from "~/api/serialization";

export const createDetail = async (
  entityId: string,
  entityType: DetailEntityType,
  req: z.infer<typeof DetailSchema>,
): Promise<ApiDetail<[]> | ApiClientErrorJson> => {
  const user = await getAuthAdminUser();

  const entity = await getEntity(entityId, entityType);
  if (!entity) {
    throw ApiClientGlobalError.NotFound("No entity exists for the provided ID and entity type.");
  }

  const parsed = DetailSchema.safeParse(req);
  if (!parsed.success) {
    throw ApiClientFieldErrors.fromZodError(parsed.error, DetailSchema).json;
  }

  const fieldErrors = new ApiClientFieldErrors();

  const { label, project: _project, ...data } = parsed.data;

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
      where: { entityId: entity.id, entityType, label },
    }))
  ) {
    fieldErrors.addUnique("label", "The 'label' must be unique for a given parent.");
  }
  if (!fieldErrors.isEmpty) {
    return fieldErrors.json;
  }

  const detail = await prisma.detail.create({
    data: {
      ...data,
      projectId: project?.id,
      entityId: entity.id,
      entityType,
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
  return convertToPlainObject(detail);
};
