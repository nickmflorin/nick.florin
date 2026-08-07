'use server';
import { updateTag } from 'next/cache';

import { type z } from 'zod';

import { getAuthedUser } from '~/application/auth/server-v2';
import {
  type BrandProject,
  calculateSkillsExperience,
  type Detail,
  type NestedDetail,
  type User,
} from '~/database/model';
import { db, type Transaction } from '~/database/prisma';
import { logger } from '~/internal/logger';
import { slugify } from '~/lib/formatters';

import { type MutationActionResponse } from '~/actions';
import { queryM2MsDynamically } from '~/actions/m2ms';
import { ProjectSchema } from '~/actions/schemas';
import {
  ApiClientFieldErrors,
  ApiClientFormError,
  ApiClientGlobalError,
  convertToPlainObject,
} from '~/api';

import { NavigationProjectsCacheTag } from './get-navigation-projects';

const UpdateProjectSchema = ProjectSchema.partial();

/**
 * Syncs the provided details with the project, which includes removing the previously existing
 * project that a {@link Detail} may have been associated with.
 */
const syncDetails = async (
  tx: Transaction,
  { details, project, user }: { details?: Detail[]; project: BrandProject; user: User },
) => {
  if (details) {
    const existingDetails = await tx.detail.findMany({ where: { projectId: project.id } });

    const toRemove = existingDetails.filter(r => !details.some(d => d.id === r.id));
    const toAdd = details.filter(d => !existingDetails.some(ed => ed.id === d.id));

    if (toRemove.length !== 0) {
      logger.info(
        `Disassociating ${toRemove.length} details from project ${project.id} (name = ` +
          `${project.name}).`,
        {
          project: project.id,
          projectName: project.name,
          removing: toRemove.map(d => `${d.id} (name = '${d.label}')`),
        },
      );
      await tx.detail.updateMany({
        data: { projectId: null, updatedById: user.id },
        where: { id: { in: toRemove.map(d => d.id) } },
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
        data: { projectId: project.id, updatedById: user.id },
        where: { id: { in: toAdd.map(d => d.id) } },
      });
    }
  }
};

/**
 * Syncs the provided nested details with the project, which includes removing the previously
 * existing project that a {@link NestedDetail} may have been associated with.
 */
const syncNestedDetails = async (
  tx: Transaction,
  {
    nestedDetails,
    project,
    user,
  }: { nestedDetails?: NestedDetail[]; project: BrandProject; user: User },
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
          project: project.id,
          projectName: project.name,
          removing: toRemove.map(d => `${d.id} (name = '${d.label}')`),
        },
      );
      await tx.nestedDetail.updateMany({
        data: { projectId: null, updatedById: user.id },
        where: { id: { in: toRemove.map(d => d.id) } },
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
        data: { projectId: project.id, updatedById: user.id },
        where: { id: { in: toAdd.map(d => d.id) } },
      });
    }
  }
};

export const updateProject = async (
  experienceId: string,
  data: z.infer<typeof UpdateProjectSchema>,
): Promise<MutationActionResponse<BrandProject>> => {
  const { error, isAdmin, user } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }

  const project = await db.project.findUnique({
    include: { skills: true },
    where: { id: experienceId },
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
    details: _details,
    name: _name,
    nestedDetails: _nestedDetails,
    repositories: _repositories,
    skills: _skills,
    slug: _slug,
    ...rest
  } = parsed.data;

  const name = _name ?? project.name;

  const fieldErrors = new ApiClientFieldErrors();

  if (_name !== undefined && _name.trim() !== project.name.trim()) {
    if (await db.project.count({ where: { id: { notIn: [project.id] }, name: _name } })) {
      fieldErrors.addUnique('name', 'The name must be unique.');
      /* If the slug is being cleared, we have to make sure that the slugified version of the new
         name is still unique. */
    } else if (
      _slug === null &&
      (await db.project.count({
        where: { id: { notIn: [project.id] }, slug: slugify(_name) },
      }))
    ) {
      fieldErrors.addUnique('name', 'The name does not generate a unique slug.');
    }
  } else if (
    _slug === null &&
    (await db.project.count({
      where: { id: { notIn: [project.id] }, slug: slugify(name) },
    }))
  ) {
    /* Here, the slug should be provided explicitly, rather than cleared.  The error is shown in
       regard to the slug, not the name, because the slug is what is being cleared whereas the name
       remains unchanged. */
    fieldErrors.addUnique(
      'slug',
      'The name generates a non-unique slug, so the slug must be provided.',
    );
  } else if (
    _slug !== null &&
    _slug !== undefined &&
    (await db.project.count({ where: { id: { notIn: [project.id] }, slug: _slug } }))
  ) {
    fieldErrors.addUnique('slug', 'The slug must be unique.');
  }

  const [details] = await queryM2MsDynamically(db, {
    fieldErrors,
    // The ids must remain undefined when the details are not provided in the payload.
    ids: _details,
    model: 'detail',
  });
  const [nestedDetails] = await queryM2MsDynamically(db, {
    fieldErrors,
    // The ids must remain undefined when the nested details are not provided in the payload.
    ids: _nestedDetails,
    model: 'nestedDetail',
  });
  const [skills] = await queryM2MsDynamically(db, {
    fieldErrors,
    ids: _skills,
    model: 'skill',
  });
  const [repositories] = await queryM2MsDynamically(db, {
    fieldErrors,
    ids: _repositories,
    model: 'repository',
  });

  if (!fieldErrors.isEmpty) {
    return { error: fieldErrors.json };
  }

  const sks = [...project.skills.map(sk => sk.id), ...(skills ?? []).map(sk => sk.id)];

  let updateData = {
    ...rest,
    name: _name === undefined || _name.trim() === project.name.trim() ? undefined : _name.trim(),
    repositories: repositories
      ? { set: repositories.map(repo => ({ slug: repo.slug })) }
      : undefined,
    skills: skills ? { set: skills.map(skill => ({ id: skill.id })) } : undefined,
    slug: _slug === undefined ? undefined : _slug === null ? slugify(name) : _slug.trim(),
    updatedById: user.id,
  };
  if (updateData.visible === false && updateData.highlighted === undefined) {
    updateData = { ...updateData, highlighted: false };
  } else if (updateData.highlighted === true && updateData.visible === undefined) {
    updateData = { ...updateData, visible: true };
  }

  return await db.$transaction(async tx => {
    const updated = await tx.project.update({
      data: updateData,
      where: { id: project.id },
    });
    if (nestedDetails) {
      await syncNestedDetails(tx, { nestedDetails, project, user });
    }
    if (details) {
      await syncDetails(tx, { details, project, user });
    }
    await calculateSkillsExperience(tx, sks, { user });
    updateTag(NavigationProjectsCacheTag);
    return { data: convertToPlainObject(updated) };
  });
};
