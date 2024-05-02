"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { type NestedApiDetail, type Project } from "~/prisma/model";
import { getDetail } from "~/actions/fetches/details";
import { queryM2MsDynamically } from "~/actions/mutations/m2ms";
import {
  ApiClientFieldErrors,
  ApiClientGlobalError,
  ApiClientFieldErrorCodes,
  type ApiClientErrorJson,
} from "~/api";
import { DetailSchema } from "~/api/schemas";
import { convertToPlainObject } from "~/api/serialization";

export const createNestedDetail = async (
  detailId: string,
  req: z.infer<typeof DetailSchema>,
): Promise<NestedApiDetail<["skills"]> | ApiClientErrorJson> => {
  const { user } = await getAuthedUser();

  const detail = await getDetail(detailId, { includes: [], visibility: "admin" });
  if (!detail) {
    return ApiClientGlobalError.NotFound("No detail exists for the provided ID.").json;
  }

  const parsed = DetailSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFieldErrors.fromZodError(parsed.error, DetailSchema).json;
  }

  const fieldErrors = new ApiClientFieldErrors();
  const { label, project: _project, skills: _skills, ...data } = parsed.data;

  return await prisma.$transaction(async tx => {
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
        where: { detailId, label },
      }))
    ) {
      fieldErrors.add("label", {
        code: ApiClientFieldErrorCodes.unique,
        message: "The 'label' must be unique for a given parent detail.",
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
      await tx.nestedDetail.create({
        data: {
          ...data,
          detailId,
          projectId: project?.id,
          label,
          createdById: user.id,
          updatedById: user.id,
          skills: skills ? { connect: skills.map(skill => ({ id: skill.id })) } : undefined,
        },
        include: { project: { include: { skills: true } }, skills: true },
      }),
    );
  });
};
