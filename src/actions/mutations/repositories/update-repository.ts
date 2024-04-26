"use server";
import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { type BrandRepository } from "~/prisma/model";
import { ApiClientFieldErrors, ApiClientGlobalError, type ApiClientErrorJson } from "~/api";
import { RepositorySchema } from "~/api/schemas";

import { queryM2MsDynamically } from "../m2ms";

const UpdateRepositorySchema = RepositorySchema.partial();

export const updateRepository = async (
  id: string,
  req: z.infer<typeof UpdateRepositorySchema>,
): Promise<
  ApiClientErrorJson<keyof (typeof UpdateRepositorySchema)["shape"]> | BrandRepository
> => {
  const user = await getAuthAdminUser();

  const parsed = UpdateRepositorySchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFieldErrors.fromZodError(parsed.error, UpdateRepositorySchema).json;
  }

  return await prisma.$transaction(async tx => {
    let repository: BrandRepository;
    try {
      repository = await tx.repository.findUniqueOrThrow({
        where: { id },
      });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        throw ApiClientGlobalError.NotFound();
      }
      throw e;
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

    repository = await tx.repository.update({
      where: { id },
      data: {
        ...data,
        updatedById: user.id,
        projects: projects ? { set: projects.map(proj => ({ id: proj.id })) } : undefined,
        skills: skills ? { set: skills.map(skill => ({ id: skill.id })) } : undefined,
      },
    });

    return repository;
  });
};
