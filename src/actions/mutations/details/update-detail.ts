"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server";
import { prisma } from "~/prisma/client";
import { calculateSkillsExperience, type Project } from "~/prisma/model";

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
    const detail = await tx.detail.findUnique({
      where: { id },
      include: { skills: true },
    });
    if (!detail) {
      throw ApiClientGlobalError.NotFound();
    }
    let project: Project | null = null;
    if (_project) {
      project = await tx.project.findUnique({ where: { id: _project } });
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

    const sks = [...detail.skills.map(sk => sk.id), ...(skills ?? []).map(sk => sk.id)];
    const updated = await tx.detail.update({
      where: { id },
      data: {
        ...data,
        projectId: project?.id,
        label,
        updatedById: user.id,
        skills: skills ? { set: skills.map(skill => ({ id: skill.id })) } : undefined,
      },
    });
    await calculateSkillsExperience(tx, sks, { user });
    return convertToPlainObject(updated);
  });
};
