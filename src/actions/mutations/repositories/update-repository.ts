"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server";
import { prisma } from "~/prisma/client";
import { type BrandRepository, type BrandSkill } from "~/prisma/model";
import { calculateSkillsExperience } from "~/prisma/model";
import { ApiClientFieldErrors, ApiClientGlobalError, type ApiClientErrorJson } from "~/api";
import { RepositorySchema } from "~/api/schemas";
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

  return await prisma.$transaction(async tx => {
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
    const updated = await tx.repository.update({
      where: { id },
      data: {
        ...data,
        updatedById: user.id,
        projects: projects ? { set: projects.map(proj => ({ id: proj.id })) } : undefined,
        skills: skills ? { set: skills.map(skill => ({ id: skill.id })) } : undefined,
      },
    });
    await calculateSkillsExperience(tx, sks, { user });
    return convertToPlainObject(updated);
  });
};
