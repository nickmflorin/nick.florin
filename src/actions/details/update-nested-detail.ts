'use server';
import { type z } from 'zod';

import { getAuthedUser } from '~/application/auth/server-v2';
import { type BrandNestedDetail, calculateSkillsExperience, type Project } from '~/database/model';
import { db } from '~/database/prisma';

import { type MutationActionResponse } from '~/actions';
import { queryM2MsDynamically } from '~/actions/m2ms';
import { DetailSchema } from '~/actions/schemas';
import {
  ApiClientFieldErrors,
  ApiClientFormError,
  ApiClientGlobalError,
  convertToPlainObject,
} from '~/api';

const UpdateNestedDetailSchema = DetailSchema.partial();

export const updateNestedDetail = async (
  nestedDetailId: string,
  data: z.infer<typeof UpdateNestedDetailSchema>,
): Promise<MutationActionResponse<BrandNestedDetail>> => {
  const { error, isAdmin, user } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }

  const nestedDetail = await db.nestedDetail.findUnique({
    include: { detail: true, skills: true },
    where: { id: nestedDetailId },
  });
  if (!nestedDetail) {
    return { error: ApiClientGlobalError.NotFound({}).json };
  }
  const parsed = UpdateNestedDetailSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: ApiClientFormError.fromZodError({ error: parsed.error }).json,
    };
  }

  const { label, project: _project, skills: _skills, ...rest } = parsed.data;
  const fieldErrors = new ApiClientFieldErrors();

  let project: null | Project = null;
  if (_project) {
    project = await db.project.findUnique({ where: { id: _project } });
    if (!project) {
      fieldErrors.addDoesNotExist('project', {
        internalMessage: `The project with ID '${_project}' does not exist.`,
        message: 'The project does not exist.',
      });
    }
  }
  if (
    label &&
    (await db.nestedDetail.count({
      where: {
        detailId: nestedDetail.detail.id,
        id: { notIn: [nestedDetail.id] },
        label,
      },
    }))
  ) {
    fieldErrors.addUnique('label', {
      message: "The 'label' must be unique for a given parent.",
    });
  }

  const [skills] = await queryM2MsDynamically(db, {
    fieldErrors,
    ids: _skills,
    model: 'skill',
  });

  if (!fieldErrors.isEmpty) {
    return { error: fieldErrors.json };
  }
  return await db.$transaction(async tx => {
    const updated = await tx.nestedDetail.update({
      data: {
        ...rest,
        label,
        projectId: project?.id,
        skills: skills ? { connect: skills.map(skill => ({ id: skill.id })) } : undefined,
        updatedById: user.id,
      },
      where: { id: nestedDetail.id },
    });
    const sks = [...nestedDetail.skills.map(sk => sk.id), ...(skills ?? []).map(sk => sk.id)];
    await calculateSkillsExperience(tx, sks, { user });
    return { data: convertToPlainObject(updated) };
  });
};
