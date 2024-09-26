"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server-v2";
import { type BrandRepository } from "~/database/model";
import { calculateSkillsExperience } from "~/database/model";
import { db } from "~/database/prisma";

import { type MutationActionResponse } from "~/actions-v2";
import { queryM2MsDynamically } from "~/actions-v2/m2ms";
import { RepositorySchema } from "~/actions-v2/schemas";
import {
  ApiClientFieldErrors,
  ApiClientGlobalError,
  ApiClientFormError,
  convertToPlainObject,
} from "~/api-v2";

const UpdateRepositorySchema = RepositorySchema.partial();

export const updateRepository = async (
  experienceId: string,
  data: z.infer<typeof UpdateRepositorySchema>,
): Promise<MutationActionResponse<BrandRepository>> => {
  const { user, error, isAdmin } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }

  const repository = await db.repository.findUnique({
    where: { id: experienceId },
    include: { skills: true },
  });
  if (!repository) {
    return { error: ApiClientGlobalError.NotFound({}).json };
  }
  const parsed = UpdateRepositorySchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: ApiClientFormError.fromZodError({ error: parsed.error }).json,
    };
  }

  const fieldErrors = new ApiClientFieldErrors();
  const { skills: _skills, projects: _projects, ...rest } = parsed.data;

  if (
    rest.slug &&
    (await db.repository.count({ where: { slug: rest.slug, id: { notIn: [repository.id] } } }))
  ) {
    fieldErrors.addUnique("slug", "The slug must be unique.");
  }

  if (
    rest.npmPackageName &&
    (await db.repository.count({
      where: { npmPackageName: rest.npmPackageName, id: { notIn: [repository.id] } },
    }))
  ) {
    fieldErrors.addUnique("npmPackageName", "The npm package name must be unique.");
  }

  const [skills] = await queryM2MsDynamically(db, {
    model: "skill",
    ids: _skills,
    fieldErrors,
  });
  const [projects] = await queryM2MsDynamically(db, {
    model: "project",
    ids: _projects,
    fieldErrors,
  });

  if (!fieldErrors.isEmpty) {
    return { error: fieldErrors.json };
  }

  const sks = [...repository.skills.map(sk => sk.id), ...(skills ?? []).map(sk => sk.id)];

  let updateData = {
    ...rest,
    updatedById: user.id,
    projects: projects ? { set: projects.map(proj => ({ id: proj.id })) } : undefined,
    skills: skills ? { set: skills.map(skill => ({ id: skill.id })) } : undefined,
  };
  if (updateData.visible === false && updateData.highlighted === undefined) {
    updateData = { ...updateData, highlighted: false };
  } else if (updateData.highlighted === true && updateData.visible === undefined) {
    updateData = { ...updateData, visible: true };
  }

  return await db.$transaction(async tx => {
    const updated = await tx.repository.update({
      where: { id: repository.id },
      data: updateData,
    });
    await calculateSkillsExperience(tx, sks, { user });
    return { data: convertToPlainObject(updated) };
  });
};
