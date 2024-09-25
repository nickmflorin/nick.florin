"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server-v2";
import { type BrandProject, type User, type Detail, type NestedDetail } from "~/database/model";
import { calculateSkillsExperience } from "~/database/model";
import { db, type Transaction } from "~/database/prisma";
import { logger } from "~/internal/logger";
import { slugify } from "~/lib/formatters";

import { type MutationActionResponse } from "~/actions-v2";
import { queryM2MsDynamically } from "~/actions-v2/m2ms";
import { ProjectSchema } from "~/actions-v2/schemas";
import {
  ApiClientFieldErrors,
  ApiClientGlobalError,
  ApiClientFormError,
  convertToPlainObject,
} from "~/api-v2";

const UpdateProjectSchema = ProjectSchema.partial();

/* Note: Syncing the details with a project means removing the previously existing project that the
   Detail may have been associated with. */
const syncDetails = async (
  tx: Transaction,
  { project, details, user }: { project: BrandProject; user: User; details?: Detail[] },
) => {
  if (details) {
    const existingDetails = await tx.detail.findMany({ where: { projectId: project.id } });

    const toRemove = existingDetails.filter(r => !details.some(d => d.id === r.id));
    const toAdd = details.filter(d => !existingDetails.some(ed => ed.id === d.id));

    if (toRemove.length !== 0) {
      logger.info(
        `Disassociating ${toRemove.length} details from project ${project.id} (name = ${project.name}).`,
        {
          removing: toRemove.map(d => `${d.id} (name = '${d.label}')`),
          project: project.id,
          projectName: project.name,
        },
      );
      await tx.detail.updateMany({
        where: { id: { in: toRemove.map(d => d.id) } },
        data: { projectId: null, updatedById: user.id },
      });
    }
    if (toAdd.length !== 0) {
      logger.info(
        `Associating ${toAdd.length} details with project ${project.id} (name = ${project.name}).`,
        {
          adding: toAdd.map(a => `${a.id} (label = '${a.label}')`),
          project: project.id,
          projectName: project.name,
        },
      );
      await tx.detail.updateMany({
        where: { id: { in: toAdd.map(d => d.id) } },
        data: { projectId: project.id, updatedById: user.id },
      });
    }
  }
};

/* Note: Syncing the nested details with a project means removing the previously existing project
     that the NestedDetail may have been associated with. */
const syncNestedDetails = async (
  tx: Transaction,
  {
    project,
    nestedDetails,
    user,
  }: { project: BrandProject; user: User; nestedDetails?: NestedDetail[] },
) => {
  if (nestedDetails) {
    const existingDetails = await tx.nestedDetail.findMany({ where: { projectId: project.id } });

    const toRemove = existingDetails.filter(r => !nestedDetails.some(d => d.id === r.id));
    const toAdd = nestedDetails.filter(d => !existingDetails.some(ed => ed.id === d.id));

    if (toRemove.length !== 0) {
      logger.info(
        `Disassociating ${toRemove.length} nested details from project ${project.id} ` +
          `(name = ${project.name}).`,
        {
          removing: toRemove.map(d => `${d.id} (name = '${d.label}')`),
          project: project.id,
          projectName: project.name,
        },
      );
      await tx.nestedDetail.updateMany({
        where: { id: { in: toRemove.map(d => d.id) } },
        data: { projectId: null, updatedById: user.id },
      });
    }
    if (toAdd.length !== 0) {
      logger.info(
        `Associating ${toAdd.length} nested details with project ${project.id} ` +
          `(name = ${project.name}).`,
        {
          adding: toAdd.map(a => `${a.id} (label = '${a.label}')`),
          project: project.id,
          projectName: project.name,
        },
      );
      await tx.detail.updateMany({
        where: { id: { in: toAdd.map(d => d.id) } },
        data: { projectId: project.id, updatedById: user.id },
      });
    }
  }
};

export const updateProject = async (
  experienceId: string,
  data: z.infer<typeof UpdateProjectSchema>,
): Promise<MutationActionResponse<BrandProject>> => {
  const { user, error, isAdmin } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }

  const project = await db.project.findUnique({
    where: { id: experienceId },
    include: { skills: true },
  });
  if (!project) {
    return { error: ApiClientGlobalError.NotFound({}).json };
  }
  const parsed = UpdateProjectSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: ApiClientFormError.fromZodError({ error: parsed.error }).json,
    };
  }

  const {
    slug: _slug,
    skills: _skills,
    details: _details,
    name: _name,
    nestedDetails: _nestedDetails,
    repositories: _repositories,
    ...rest
  } = parsed.data;

  const name = _name !== undefined ? _name : project.name;

  const fieldErrors = new ApiClientFieldErrors();

  if (_name !== undefined && _name.trim() !== project.name.trim()) {
    if (await db.project.count({ where: { name: _name, id: { notIn: [project.id] } } })) {
      fieldErrors.addUnique("name", "The name must be unique.");
      /* If the slug is being cleared, we have to make sure that the slugified version of the new
         name is still unique. */
    } else if (
      _slug === null &&
      (await db.project.count({
        where: { slug: slugify(_name), id: { notIn: [project.id] } },
      }))
    ) {
      // Here, the slug should be provided explicitly, rather than cleared.
      fieldErrors.addUnique("name", "The name does not generate a unique slug.");
    }
  } else if (
    _slug === null &&
    (await db.project.count({
      where: { slug: slugify(name), id: { notIn: [project.id] } },
    }))
  ) {
    /* Here, the slug should be provided explicitly, rather than cleared.  The error is shown in
       regard to the slug, not the name, because the slug is what is being cleared whereas the
       name remains unchanged. */
    fieldErrors.addUnique(
      "slug",
      "The name generates a non-unique slug, so the slug must be provided.",
    );
  } else if (
    _slug !== null &&
    _slug !== undefined &&
    (await db.project.count({ where: { slug: _slug, id: { notIn: [project.id] } } }))
  ) {
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

  const sks = [...project.skills.map(sk => sk.id), ...(skills ?? []).map(sk => sk.id)];

  let updateData = {
    ...rest,
    slug: _slug === undefined ? undefined : _slug === null ? slugify(name) : _slug.trim(),
    name: _name === undefined || _name.trim() === project.name.trim() ? undefined : _name.trim(),
    updatedById: user.id,
    repositories: repositories
      ? { set: repositories.map(repo => ({ slug: repo.slug })) }
      : undefined,
    skills: skills ? { set: skills.map(skill => ({ id: skill.id })) } : undefined,
  };
  if (updateData.visible === false && updateData.highlighted === undefined) {
    updateData = { ...updateData, highlighted: false };
  } else if (updateData.highlighted === true && updateData.visible === undefined) {
    updateData = { ...updateData, visible: true };
  }

  return await db.$transaction(async tx => {
    const updated = await tx.project.update({
      where: { id: project.id },
      data: updateData,
    });
    if (nestedDetails) {
      await syncNestedDetails(tx, { project, nestedDetails, user });
    }
    if (details) {
      await syncDetails(tx, { project, details, user });
    }
    await calculateSkillsExperience(tx, sks, { user });
    return { data: convertToPlainObject(updated) };
  });
};
