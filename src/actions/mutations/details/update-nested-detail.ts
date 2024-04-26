"use server";
import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { type NestedDetail, type Detail, type Project } from "~/prisma/model";
import { queryM2MsDynamically } from "~/actions/mutations/m2ms";
import {
  ApiClientFieldErrors,
  ApiClientFormError,
  ApiClientFieldErrorCodes,
  ApiClientGlobalError,
} from "~/api";
import { DetailSchema } from "~/api/schemas";
import { convertToPlainObject } from "~/api/serialization";

const UpdateDetailSchema = DetailSchema.partial();

export const updateNestedDetail = async (id: string, req: z.infer<typeof UpdateDetailSchema>) => {
  const user = await getAuthAdminUser();

  const parsed = UpdateDetailSchema.safeParse(req);
  if (!parsed.success) {
    throw ApiClientFormError.BadRequest(parsed.error, UpdateDetailSchema);
  }
  const { label, project: _project, skills: _skills, ...data } = parsed.data;
  const fieldErrors = new ApiClientFieldErrors();

  return await prisma.$transaction(async tx => {
    let nestedDetail: NestedDetail & { readonly detail: Detail };
    try {
      nestedDetail = await tx.nestedDetail.findUniqueOrThrow({
        where: { id },
        include: { detail: true },
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
      (await tx.nestedDetail.count({
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

    const [skills] = await queryM2MsDynamically(tx, {
      model: "skill",
      ids: _skills,
      fieldErrors,
    });

    if (!fieldErrors.isEmpty) {
      return fieldErrors.json;
    }

    return convertToPlainObject(
      await tx.nestedDetail.update({
        where: { id },
        data: {
          ...data,
          projectId: project?.id,
          label,
          updatedById: user.id,
          skills: skills ? { connect: skills.map(skill => ({ id: skill.id })) } : undefined,
        },
      }),
    );
  });
};
