"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server";
import { calculateSkillsExperience } from "~/database/model";
import { db } from "~/database/prisma";
import { logger } from "~/internal/logger";

import { queryM2MsDynamically } from "~/actions/mutations/m2ms";
import { EducationSchema } from "~/actions-v2/schemas";
import { ApiClientFieldErrors } from "~/api";
import { convertToPlainObject } from "~/api/serialization";

export const createEducation = async (req: z.infer<typeof EducationSchema>) => {
  const { user } = await getAuthedUser();

  const parsed = EducationSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFieldErrors.fromZodError(parsed.error, EducationSchema).json;
  }

  const { school: schoolId, skills: _skills, ...data } = parsed.data;
  const fieldErrors = new ApiClientFieldErrors();

  return await db.$transaction(async tx => {
    /* Note: We are already guaranteed to be dealing with UUIDs due to the Zod schema check, so
       we do not need to worry about checking isPrismaInvalidIdError here. */
    const school = await tx.school.findUniqueOrThrow({ where: { id: schoolId } });
    if (!school) {
      return fieldErrors.addDoesNotExist("school", "The school does not exist.").json;
    }
    if (await tx.education.count({ where: { schoolId: school.id, major: data.major } })) {
      fieldErrors.addUnique("major", "The 'major' must be unique for a given school.");
    }
    if (
      data.shortMajor &&
      (await tx.education.count({
        where: { schoolId: school.id, shortMajor: data.shortMajor },
      }))
    ) {
      fieldErrors.addUnique("shortMajor", "The 'shortMajor' must be unique for a given school.");
    }

    const [skills] = await queryM2MsDynamically(tx, {
      model: "skill",
      ids: _skills,
      fieldErrors,
    });

    if (fieldErrors.hasErrors) {
      return fieldErrors.json;
    }
    const education = await tx.education.create({
      data: {
        ...data,
        schoolId: school.id,
        createdById: user.id,
        updatedById: user.id,
        skills: skills ? { connect: skills.map(skill => ({ id: skill.id })) } : undefined,
      },
    });
    if (skills && skills.length !== 0) {
      logger.info(
        `Recalculating experience for ${skills.length} skill(s) associated with new education, ` +
          `'${education.major}'.`,
        { educationId: education.id, skills: skills.map(s => s.id) },
      );
      await calculateSkillsExperience(
        tx,
        skills.map(sk => sk.id),
        { user },
      );
      logger.info(
        `Successfully recalculated experience for ${skills.length} skill(s) associated with ` +
          `new education, '${education.major}'.`,
        { educationId: education.id, skills: skills.map(s => s.id) },
      );
    }
    return convertToPlainObject(education);
  });
};
