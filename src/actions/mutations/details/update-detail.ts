"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { type Detail, type Project } from "~/prisma/model";
import { queryM2MsDynamically } from "~/actions/mutations/m2ms";
import { ApiClientFieldErrors, ApiClientGlobalError } from "~/api";
import { DetailSchema } from "~/api/schemas";
import { convertToPlainObject } from "~/api/serialization";

const UpdateDetailSchema = DetailSchema.partial();

export const updateDetail = async (id: string, req: z.infer<typeof UpdateDetailSchema>) => {
  const { user } = await getAuthedUser();

  const parsed = UpdateDetailSchema.safeParse(req);
  if (!parsed.success) {
    throw ApiClientFieldErrors.fromZodError(parsed.error, UpdateDetailSchema).error;
  }

  const { label, project: _project, skills: _skills, ...data } = parsed.data;
  const fieldErrors = new ApiClientFieldErrors();

  return await prisma.$transaction(async tx => {
    let detail: Detail;
    try {
      detail = await tx.detail.findUniqueOrThrow({
        where: { id },
      });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        throw ApiClientGlobalError.NotFound();
      }
      throw e;
    }

    let project: Project | null = null;
    if (_project) {
      try {
        project = await tx.project.findUniqueOrThrow({ where: { id: _project } });
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
      (await tx.detail.count({
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

    const [skills] = await queryM2MsDynamically(tx, {
      model: "skill",
      ids: _skills,
      fieldErrors,
    });

    if (!fieldErrors.isEmpty) {
      return fieldErrors.json;
    }

    return convertToPlainObject(
      await tx.detail.update({
        where: { id },
        data: {
          ...data,
          projectId: project?.id,
          label,
          updatedById: user.id,
          skills: skills ? { set: skills.map(skill => ({ id: skill.id })) } : undefined,
        },
      }),
    );
  });
};
