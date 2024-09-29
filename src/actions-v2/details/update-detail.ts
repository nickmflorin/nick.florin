"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server-v2";
import { type BrandDetail, calculateSkillsExperience, type Project } from "~/database/model";
import { db } from "~/database/prisma";

import { type MutationActionResponse } from "~/actions-v2";
import { queryM2MsDynamically } from "~/actions-v2/m2ms";
import { DetailSchema } from "~/actions-v2/schemas";
import {
  ApiClientFieldErrors,
  ApiClientGlobalError,
  ApiClientFormError,
  convertToPlainObject,
} from "~/api-v2";

const UpdateDetailSchema = DetailSchema.partial();

export const updateDetail = async (
  detailId: string,
  data: z.infer<typeof UpdateDetailSchema>,
): Promise<MutationActionResponse<BrandDetail>> => {
  const { user, error, isAdmin } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }

  const detail = await db.detail.findUnique({
    where: { id: detailId },
    include: { skills: true },
  });
  if (!detail) {
    return { error: ApiClientGlobalError.NotFound({}).json };
  }
  const parsed = UpdateDetailSchema.safeParse(data);
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

  const [skills] = await queryM2MsDynamically(db, {
    model: "skill",
    ids: _skills,
    fieldErrors,
  });

  if (!fieldErrors.isEmpty) {
    return { error: fieldErrors.json };
  }

  return await db.$transaction(async tx => {
    const updated = await tx.detail.update({
      where: { id: detail.id },
      data: {
        ...rest,
        projectId: project?.id,
        label,
        updatedById: user.id,
        skills: skills ? { set: skills.map(skill => ({ id: skill.id })) } : undefined,
      },
    });
    const sks = [...detail.skills.map(sk => sk.id), ...(skills ?? []).map(sk => sk.id)];
    await calculateSkillsExperience(tx, sks, { user });
    return { data: convertToPlainObject(updated) };
  });
};
