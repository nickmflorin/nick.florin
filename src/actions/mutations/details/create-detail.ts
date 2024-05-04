"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server";
import { logger } from "~/application/logger";
import { prisma } from "~/prisma/client";
import { type DetailEntityType, type Project, type ApiDetail } from "~/prisma/model";
import { calculateSkillsExperience } from "~/prisma/model";
import { getEntity } from "~/actions/fetches/get-entity";
import { queryM2MsDynamically } from "~/actions/mutations/m2ms";
import { ApiClientFieldErrors } from "~/api";
import { ApiClientGlobalError, type ApiClientErrorJson } from "~/api";
import { DetailSchema } from "~/api/schemas";
import { convertToPlainObject } from "~/api/serialization";

export const createDetail = async (
  entityId: string,
  entityType: DetailEntityType,
  req: z.infer<typeof DetailSchema>,
): Promise<ApiDetail<["skills"]> | ApiClientErrorJson> => {
  const { user } = await getAuthedUser();

  const entity = await getEntity(entityId, entityType);
  if (!entity) {
    throw ApiClientGlobalError.NotFound("No entity exists for the provided ID and entity type.");
  }

  const parsed = DetailSchema.safeParse(req);
  if (!parsed.success) {
    throw ApiClientFieldErrors.fromZodError(parsed.error, DetailSchema).json;
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
    if (
      label &&
      (await tx.detail.count({
        where: { entityId: entity.id, entityType, label },
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

    const detail = await tx.detail.create({
      data: {
        ...data,
        projectId: project?.id,
        entityId: entity.id,
        entityType,
        label,
        createdById: user.id,
        updatedById: user.id,
        skills: skills ? { connect: skills.map(skill => ({ id: skill.id })) } : undefined,
      },
      include: { project: { include: { skills: true } }, skills: true },
    });
    if (skills && skills.length !== 0) {
      logger.info(
        `Recalculating experience for ${skills.length} skill(s) associated with new detail, ` +
          `'${detail.id}'.`,
        { detailId: detail.id, skills: skills.map(s => s.id) },
      );
      await calculateSkillsExperience(
        tx,
        skills.map(sk => sk.id),
        { user },
      );
      logger.info(
        `Successfully recalculated experience for ${skills.length} skill(s) associated with ` +
          `new detail, '${detail.id}'.`,
        { detailId: detail.id, skills: skills.map(s => s.id) },
      );
    }
    return convertToPlainObject(detail);
  });
};
