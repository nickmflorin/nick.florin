"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server";
import { type NestedApiDetail, type Project } from "~/database/model";
import { calculateSkillsExperience } from "~/database/model";
import { prisma } from "~/database/prisma";
import { logger } from "~/internal/logger";

import { getDetail } from "~/actions/fetches/details";
import { queryM2MsDynamically } from "~/actions/mutations/m2ms";
import { DetailSchema } from "~/actions-v2/schemas";
import {
  ApiClientFieldErrors,
  ApiClientGlobalError,
  ApiClientFieldErrorCodes,
  type ApiClientErrorJson,
} from "~/api";
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
      project = await tx.project.findUniqueOrThrow({ where: { id: _project } });
      if (!project) {
        fieldErrors.addDoesNotExist("project", {
          message: "The project does not exist.",
          internalMessage: `The project with ID '${_project}' does not exist.`,
        });
      }
    }
    if (label && (await tx.nestedDetail.count({ where: { detailId, label } }))) {
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
    const detail = await tx.nestedDetail.create({
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
    });
    if (skills && skills.length !== 0) {
      logger.info(
        `Recalculating experience for ${skills.length} skill(s) associated with new nested ` +
          `detail, '${detail.id}'.`,
        { nestedDetailId: detail.id, skills: skills.map(s => s.id) },
      );
      await calculateSkillsExperience(
        tx,
        skills.map(sk => sk.id),
        { user },
      );
      logger.info(
        `Successfully recalculated experience for ${skills.length} skill(s) associated with ` +
          `new nested detail, '${detail.id}'.`,
        { nestedDetailId: detail.id, skills: skills.map(s => s.id) },
      );
    }
    return convertToPlainObject(detail);
  });
};
