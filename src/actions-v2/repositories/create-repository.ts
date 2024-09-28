"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server-v2";
import { type BrandRepository } from "~/database/model";
import { calculateSkillsExperience } from "~/database/model";
import { db } from "~/database/prisma";
import { logger } from "~/internal/logger";

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

export const createRepository = async (
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

  const parsed = RepositorySchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: ApiClientFormError.fromZodError({ error: parsed.error }).json,
    };
  }

  const { skills: _skills, projects: _projects, ...rest } = parsed.data;

  const fieldErrors = new ApiClientFieldErrors();

  if (await db.repository.count({ where: { slug: rest.slug } })) {
    fieldErrors.addUnique("slug", "The slug must be unique.");
  }
  if (
    rest.npmPackageName &&
    (await db.repository.count({ where: { npmPackageName: rest.npmPackageName } }))
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
  return await db.$transaction(async tx => {
    const repository = await tx.repository.create({
      data: {
        ...rest,
        createdById: user.id,
        updatedById: user.id,
        projects: projects ? { connect: projects.map(proj => ({ id: proj.id })) } : undefined,
        skills: skills ? { connect: skills.map(skill => ({ slug: skill.slug })) } : undefined,
      },
    });
    if (skills && skills.length !== 0) {
      logger.info(
        `Recalculating experience for ${skills.length} skill(s) associated with new repository, ` +
          `'${repository.slug}'.`,
        { repositoryId: repository.id, skills: skills.map(s => s.id) },
      );
      await calculateSkillsExperience(
        tx,
        skills.map(sk => sk.id),
        { user },
      );
      logger.info(
        `Successfully recalculated experience for ${skills.length} skill(s) associated with ` +
          `new repository, '${repository.slug}'.`,
        { repositoryId: repository.id, skills: skills.map(s => s.id) },
      );
    }
    return { data: convertToPlainObject(repository) };
  });
};
