"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server";
import { type BrandRepository, type BrandSkill } from "~/database/model";
import { calculateSkillsExperience } from "~/database/model";
import { db } from "~/database/prisma";

import { RepositorySchema } from "~/actions-v2/schemas";
import { ApiClientFieldErrors, ApiClientGlobalError, type ApiClientErrorJson } from "~/api";
import { convertToPlainObject } from "~/api/serialization";

import { queryM2MsDynamically } from "../m2ms";

const UpdateRepositorySchema = RepositorySchema.partial();

export const updateRepository = async (
  id: string,
  req: z.infer<typeof UpdateRepositorySchema>,
): Promise<
  ApiClientErrorJson<keyof (typeof UpdateRepositorySchema)["shape"]> | BrandRepository
> => {
  const { user } = await getAuthedUser();

  const parsed = UpdateRepositorySchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFieldErrors.fromZodError(parsed.error, UpdateRepositorySchema).json;
  }

  return await db.$transaction(async tx => {
    const repository: (BrandRepository & { readonly skills: BrandSkill[] }) | null =
      await tx.repository.findUnique({
        where: { id },
        include: { skills: true },
      });
    if (!repository) {
      throw ApiClientGlobalError.NotFound();
    }

    const parsed = UpdateRepositorySchema.safeParse(req);
    if (!parsed.success) {
      return ApiClientFieldErrors.fromZodError(parsed.error, UpdateRepositorySchema).json;
    }

    const fieldErrors = new ApiClientFieldErrors();
    const { skills: _skills, projects: _projects, ...data } = parsed.data;

    if (
      data.slug &&
      (await tx.repository.count({ where: { slug: data.slug, id: { notIn: [repository.id] } } }))
    ) {
      fieldErrors.addUnique("slug", "The slug must be unique.");
    }

    if (
      data.npmPackageName &&
      (await tx.repository.count({
        where: { npmPackageName: data.npmPackageName, id: { notIn: [repository.id] } },
      }))
    ) {
      fieldErrors.addUnique("npmPackageName", "The npm package name must be unique.");
    }

    const [skills] = await queryM2MsDynamically(tx, {
      model: "skill",
      ids: _skills,
      fieldErrors,
    });
    const [projects] = await queryM2MsDynamically(tx, {
      model: "project",
      ids: _projects,
      fieldErrors,
    });

    if (!fieldErrors.isEmpty) {
      return fieldErrors.json;
    }

    const sks = [...repository.skills.map(sk => sk.id), ...(skills ?? []).map(sk => sk.id)];

    let updateData = {
      ...data,
      updatedById: user.id,
      projects: projects ? { set: projects.map(proj => ({ id: proj.id })) } : undefined,
      skills: skills ? { set: skills.map(skill => ({ id: skill.id })) } : undefined,
    };
    if (updateData.visible === false && updateData.highlighted === undefined) {
      updateData = { ...updateData, highlighted: false };
    } else if (updateData.highlighted === true && updateData.visible === undefined) {
      updateData = { ...updateData, visible: true };
    }

    const updated = await tx.repository.update({
      where: { id },
      data: updateData,
    });
    await calculateSkillsExperience(tx, sks, { user });
    return convertToPlainObject(updated);
  });
};
