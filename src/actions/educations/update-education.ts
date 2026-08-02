'use server';
import { type z } from 'zod';

import { getAuthedUser } from '~/application/auth/server-v2';
import { type BrandEducation, calculateSkillsExperience, type School } from '~/database/model';
import { db } from '~/database/prisma';

import { type MutationActionResponse } from '~/actions';
import { queryM2MsDynamically } from '~/actions/m2ms';
import { EducationSchema } from '~/actions/schemas';
import {
  ApiClientFieldErrors,
  ApiClientFormError,
  ApiClientGlobalError,
  convertToPlainObject,
} from '~/api';

const UpdateEducationSchema = EducationSchema.partial();

export const updateEducation = async (
  educationId: string,
  data: z.infer<typeof UpdateEducationSchema>,
): Promise<MutationActionResponse<BrandEducation>> => {
  const { error, isAdmin, user } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }

  const education = await db.education.findUnique({
    include: { school: true, skills: true },
    where: { id: educationId },
  });
  if (!education) {
    return { error: ApiClientGlobalError.NotFound({}).json };
  }
  const parsed = UpdateEducationSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: ApiClientFormError.fromZodError({ error: parsed.error }).json,
    };
  }

  const { major, school: schoolId, skills: _skills, ...rest } = parsed.data;
  const fieldErrors = new ApiClientFieldErrors();

  let school: School = education.school;
  if (schoolId) {
    /* We are already guaranteed to be dealing with UUIDs due to the Zod schema check, so we do not
       need to worry about checking isPrismaInvalidIdError here. */
    const s = await db.school.findUnique({ where: { id: schoolId } });
    if (!s) {
      return {
        error: ApiClientFieldErrors.doesNotExist('school', 'The school does not exist.').json,
      };
    }
    school = s;
  }
  if (
    major &&
    (await db.education.count({
      where: { id: { notIn: [education.id] }, major, schoolId: school.id },
    }))
  ) {
    fieldErrors.addUnique('major', "The 'major' must be unique for a given school.");
  }
  if (
    rest.shortMajor &&
    (await db.education.count({
      where: { id: { notIn: [education.id] }, schoolId: school.id, shortMajor: rest.shortMajor },
    }))
  ) {
    fieldErrors.addUnique('shortMajor', "The 'shortMajor' must be unique for a given school.");
  }

  const [skills] = await queryM2MsDynamically(db, {
    fieldErrors,
    ids: _skills,
    model: 'skill',
  });

  if (fieldErrors.hasErrors) {
    return { error: fieldErrors.json };
  }
  const sks = [...education.skills.map(sk => sk.id), ...(skills ?? []).map(sk => sk.id)];
  let updateData = {
    ...rest,
    major,
    schoolId: school.id,
    skills: skills ? { set: skills.map(skill => ({ id: skill.id })) } : undefined,
    updatedById: user.id,
  };
  if (updateData.visible === false && updateData.highlighted === undefined) {
    updateData = { ...updateData, highlighted: false };
  } else if (updateData.highlighted === true && updateData.visible === undefined) {
    updateData = { ...updateData, visible: true };
  }
  return await db.$transaction(async tx => {
    const updated = await tx.education.update({
      data: updateData,
      include: { school: true },
      where: { id: education.id },
    });
    await calculateSkillsExperience(tx, sks, { user });
    return { data: convertToPlainObject(updated) };
  });
};
