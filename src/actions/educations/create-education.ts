'use server';
import { type z } from 'zod';

import { getAuthedUser } from '~/application/auth/server-v2';
import { type BrandEducation, calculateSkillsExperience } from '~/database/model';
import { db } from '~/database/prisma';
import { logger } from '~/internal/logger';

import { type MutationActionResponse } from '~/actions';
import { queryM2MsDynamically } from '~/actions/m2ms';
import { EducationSchema } from '~/actions/schemas';
import {
  ApiClientFieldErrors,
  ApiClientFormError,
  ApiClientGlobalError,
  convertToPlainObject,
} from '~/api';

export const createEducation = async (
  data: z.infer<typeof EducationSchema>,
): Promise<MutationActionResponse<BrandEducation>> => {
  const { error, isAdmin, user } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }

  const parsed = EducationSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: ApiClientFormError.fromZodError({ error: parsed.error }).json,
    };
  }

  const { school: schoolId, skills: _skills, ...rest } = parsed.data;

  /* We are already guaranteed to be dealing with UUIDs due to the Zod schema check, so we do not
     need to worry about checking isPrismaInvalidIdError here. */
  const school = await db.school.findUnique({ where: { id: schoolId } });
  if (!school) {
    return {
      error: ApiClientFieldErrors.doesNotExist('school', 'The school does not exist.').json,
    };
  }

  const fieldErrors = new ApiClientFieldErrors();

  if (await db.education.count({ where: { major: rest.major, schoolId: school.id } })) {
    fieldErrors.addUnique('major', "The 'major' must be unique for a given school.");
  }
  if (
    rest.shortMajor &&
    (await db.education.count({
      where: { schoolId: school.id, shortMajor: rest.shortMajor },
    }))
  ) {
    fieldErrors.addUnique('shortMajor', "The 'shortMajor' must be unique for a given school.");
  }

  const [skills] = await queryM2MsDynamically(db, {
    fieldErrors,
    ids: _skills,
    model: 'skill',
  });

  if (!fieldErrors.isEmpty) {
    return { error: fieldErrors.json };
  }

  let createData = {
    ...rest,
    createdById: user.id,
    schoolId: school.id,
    skills: skills ? { connect: skills.map(skill => ({ id: skill.id })) } : undefined,
    updatedById: user.id,
  };
  if (createData.visible === false && createData.highlighted === undefined) {
    createData = { ...createData, highlighted: false };
  } else if (createData.highlighted === true && createData.visible === undefined) {
    createData = { ...createData, visible: true };
  }

  return await db.$transaction(async tx => {
    const education = await tx.education.create({ data: createData, include: { school: true } });

    if (skills && skills.length !== 0) {
      logger.info(
        `Recalculating education for ${skills.length} skill(s) associated with new education, ` +
          `'${education.major}'.`,
        { educationId: education.id, skills: skills.map(s => s.id) },
      );
      await calculateSkillsExperience(
        tx,
        skills.map(sk => sk.id),
        { user },
      );
      logger.info(
        `Successfully recalculated education for ${skills.length} skill(s) associated with ` +
          `new education, '${education.major}'.`,
        { educationId: education.id, skills: skills.map(s => s.id) },
      );
    }
    return { data: convertToPlainObject(education) };
  });
};
