"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server-v2";
import { type ApiDetail, type Project, type DetailEntityType } from "~/database/model";
import { calculateSkillsExperience } from "~/database/model";
import { db } from "~/database/prisma";
import { logger } from "~/internal/logger";
import { isUuid } from "~/lib/typeguards";

import { type MutationActionResponse } from "~/actions-v2";
import { getEntity } from "~/actions-v2/get-entity";
import { queryM2MsDynamically } from "~/actions-v2/m2ms";
import { DetailSchema } from "~/actions-v2/schemas";
import {
  ApiClientFieldErrors,
  ApiClientGlobalError,
  ApiClientFormError,
  convertToPlainObject,
} from "~/api-v2";

export const createDetail = async (
  entityId: string,
  entityType: DetailEntityType,
  data: z.infer<typeof DetailSchema>,
): Promise<MutationActionResponse<ApiDetail<["skills"]>>> => {
  const { user, error, isAdmin } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  } else if (!isUuid(entityId)) {
    logger.error(`Unexpectedly received invalid ID, '${entityId}', when fetching a detail.`, {
      id: entityId,
    });
    return {
      error: ApiClientGlobalError.NotFound({
        message: "The requested entity resource could not be found.",
      }).json,
    };
  }
  const entity = await getEntity(entityId, entityType);
  if (!entity) {
    return {
      error: ApiClientGlobalError.NotFound({
        message: "The requested entity resource could not be found.",
      }).json,
    };
  }

  const parsed = DetailSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: ApiClientFormError.fromZodError({ error: parsed.error }).json,
    };
  }

  const { label, project: _project, skills: _skills, ...rest } = parsed.data;
  const fieldErrors = new ApiClientFieldErrors();

  let project: Project | null = null;
  if (_project) {
    project = await db.project.findUnique({ where: { id: _project } });
    if (!project) {
      fieldErrors.addDoesNotExist("project", {
        message: "The project does not exist.",
        internalMessage: `The project with ID '${_project}' does not exist.`,
      });
    }
  }
  if (
    label &&
    (await db.detail.count({
      where: { entityId, entityType, label },
    }))
  ) {
    fieldErrors.addUnique("label", "The 'label' must be unique for a given parent.");
  }

  const [skills] = await queryM2MsDynamically(db, {
    model: "skill",
    ids: _skills,
    fieldErrors,
  });

  if (!fieldErrors.isEmpty) {
    return { error: fieldErrors.json };
  }

  return await db.$transaction(async tx => {
    const detail = await tx.detail.create({
      data: {
        ...rest,
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
    return { data: convertToPlainObject(detail) };
  });
};
