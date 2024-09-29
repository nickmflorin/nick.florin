"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server-v2";
import { type ApiNestedDetail, type Project } from "~/database/model";
import { calculateSkillsExperience } from "~/database/model";
import { db } from "~/database/prisma";
import { logger } from "~/internal/logger";
import { isUuid } from "~/lib/typeguards";

import { type MutationActionResponse } from "~/actions";
import { queryM2MsDynamically } from "~/actions/m2ms";
import { DetailSchema } from "~/actions/schemas";
import {
  ApiClientFieldErrors,
  ApiClientGlobalError,
  ApiClientFormError,
  convertToPlainObject,
} from "~/api";

export const createNestedDetail = async (
  detailId: string,
  data: z.infer<typeof DetailSchema>,
): Promise<MutationActionResponse<ApiNestedDetail<["skills"]>>> => {
  const { user, error, isAdmin } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  } else if (!isUuid(detailId)) {
    logger.error(`Unexpectedly received invalid ID, '${detailId}', when fetching a nestedDetail.`, {
      id: detailId,
    });
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
    project = await db.project.findUniqueOrThrow({ where: { id: _project } });
    if (!project) {
      fieldErrors.addDoesNotExist("project", {
        message: "The project does not exist.",
        internalMessage: `The project with ID '${_project}' does not exist.`,
      });
    }
  }
  if (label && (await db.nestedDetail.count({ where: { detailId, label } }))) {
    fieldErrors.addUnique("label", {
      message: "The 'label' must be unique for a given parent detail.",
    });
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
    const detail = await tx.nestedDetail.create({
      data: {
        ...rest,
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
    return { data: convertToPlainObject(detail) };
  });
};
