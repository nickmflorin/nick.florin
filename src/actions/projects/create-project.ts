"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server-v2";
import { type BrandProject } from "~/database/model";
import { calculateSkillsExperience } from "~/database/model";
import { db } from "~/database/prisma";
import { logger } from "~/internal/logger";
import { slugify } from "~/lib/formatters";

import { type MutationActionResponse } from "~/actions";
import { queryM2MsDynamically } from "~/actions/m2ms";
import { ProjectSchema } from "~/actions/schemas";
import {
  ApiClientFieldErrors,
  ApiClientGlobalError,
  ApiClientFormError,
  convertToPlainObject,
} from "~/api";

export const createProject = async (
  data: z.infer<typeof ProjectSchema>,
): Promise<MutationActionResponse<BrandProject>> => {
  const { user, error, isAdmin } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }

  const parsed = ProjectSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: ApiClientFormError.fromZodError({ error: parsed.error }).json,
    };
  }

  const {
    slug: _slug,
    details: _details,
    nestedDetails: _nestedDetails,
    skills: _skills,
    repositories: _repositories,
    ...rest
  } = parsed.data;

  const fieldErrors = new ApiClientFieldErrors();
  const slug = _slug ?? slugify(rest.name);

  if (await db.project.count({ where: { name: rest.name } })) {
    fieldErrors.addUnique("name", "The name must be unique.");
    /* If the slug is not explicitly provided and the name does not violate the unique
       constraint, but the slugified form of the name does, this should be a more specific error
       message. */
  } else if (!_slug && (await db.project.count({ where: { slug } }))) {
    fieldErrors.addUnique(
      "name",
      "The auto-generated slug for the name is not unique. Please provide a unique slug.",
    );
  }
  if (_slug && (await db.project.count({ where: { slug: _slug } }))) {
    fieldErrors.addUnique("slug", "The slug must be unique.");
  }

  const [details] = await queryM2MsDynamically(db, {
    model: "detail",
    // It is important to cast to undefined if the details are not provided in the payload!
    ids: _details,
    fieldErrors,
  });
  const [nestedDetails] = await queryM2MsDynamically(db, {
    model: "nestedDetail",
    // It is important to cast to undefined if the details are not provided in the payload!
    ids: _nestedDetails,
    fieldErrors,
  });
  const [skills] = await queryM2MsDynamically(db, {
    model: "skill",
    ids: _skills,
    fieldErrors,
  });
  const [repositories] = await queryM2MsDynamically(db, {
    model: "repository",
    ids: _repositories,
    fieldErrors,
  });

  if (!fieldErrors.isEmpty) {
    return { error: fieldErrors.json };
  }

  let createData = {
    ...rest,
    slug,
    createdById: user.id,
    updatedById: user.id,
    repositories: repositories
      ? { connect: repositories.map(repo => ({ slug: repo.slug })) }
      : undefined,
    skills: skills ? { connect: skills.map(skill => ({ slug: skill.slug })) } : undefined,
  };
  if (createData.visible === false && createData.highlighted === undefined) {
    createData = { ...createData, highlighted: false };
  } else if (createData.highlighted === true && createData.visible === undefined) {
    createData = { ...createData, visible: true };
  }

  return await db.$transaction(async tx => {
    const project = await tx.project.create({ data: createData });
    if (details && details.length !== 0) {
      logger.info(`Associating ${details.length} details with new project, '${project.name}'.`, {
        projectId: project.id,
      });
      const result = await tx.detail.updateMany({
        where: { id: { in: details.map(d => d.id) } },
        data: { projectId: project.id, updatedById: user.id },
      });
      logger.info(
        `Successfully associated ${result.count} details with new project, '${project.name}'.`,
        { projectId: project.id },
      );
    }
    if (nestedDetails && nestedDetails.length !== 0) {
      logger.info(
        `Associating ${nestedDetails.length} nested details with new project, '${project.name}'.`,
        { projectId: project.id },
      );
      const result = await tx.nestedDetail.updateMany({
        where: { id: { in: nestedDetails.map(d => d.id) } },
        data: { projectId: project.id, updatedById: user.id },
      });
      logger.info(
        `Successfully associated ${result.count} nested details with new project, '${project.name}'.`,
        { projectId: project.id },
      );
    }

    if (skills && skills.length !== 0) {
      logger.info(
        `Recalculating experience for ${skills.length} skill(s) associated with new project, '${project.name}'.`,
        { projectId: project.id, skills: skills.map(s => s.id) },
      );
      await calculateSkillsExperience(
        tx,
        skills.map(sk => sk.id),
        { user },
      );
      logger.info(
        `Successfully recalculated experience for ${skills.length} skill(s) associated with ` +
          `new project, '${project.name}'.`,
        { projectId: project.id, skills: skills.map(s => s.id) },
      );
    }
    return { data: convertToPlainObject(project) };
  });
};
