"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server";
import { calculateSkillsExperience } from "~/database/model";
import { prisma } from "~/database/prisma";
import { logger } from "~/internal/logger";

import { RepositorySchema } from "~/actions-v2/schemas";
import { ApiClientFieldErrors } from "~/api";
import { convertToPlainObject } from "~/api/serialization";

import { queryM2MsDynamically } from "../m2ms";

export const createRepository = async (req: z.infer<typeof RepositorySchema>) => {
  const { user } = await getAuthedUser();

  const parsed = RepositorySchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFieldErrors.fromZodError(parsed.error, RepositorySchema).json;
  }
  const { skills: _skills, projects: _projects, ...data } = parsed.data;

  const fieldErrors = new ApiClientFieldErrors();

  return await prisma.$transaction(async tx => {
    if (await tx.repository.count({ where: { slug: data.slug } })) {
      fieldErrors.addUnique("slug", "The slug must be unique.");
    }
    if (await tx.repository.count({ where: { npmPackageName: data.npmPackageName } })) {
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
    const repository = await tx.repository.create({
      data: {
        ...data,
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
    return convertToPlainObject(repository);
  });
};
