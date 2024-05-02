"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server";
import { isPrismaDoesNotExistError, prisma } from "~/prisma/client";
import { type School } from "~/prisma/model";
import { queryM2MsDynamically } from "~/actions/mutations/m2ms";
import { ApiClientFieldErrors } from "~/api";
import { EducationSchema } from "~/api/schemas";
import { convertToPlainObject } from "~/api/serialization";

export const createEducation = async (req: z.infer<typeof EducationSchema>) => {
  const { user } = await getAuthedUser();

  const parsed = EducationSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFieldErrors.fromZodError(parsed.error, EducationSchema).json;
  }

  const { school: schoolId, skills: _skills, ...data } = parsed.data;
  const fieldErrors = new ApiClientFieldErrors();

  return await prisma.$transaction(async tx => {
    let school: School;
    try {
      school = await tx.school.findUniqueOrThrow({ where: { id: schoolId } });
    } catch (e) {
      /* Note: We are already guaranteed to be dealing with UUIDs due to the Zod schema check, so
       we do not need to worry about checking isPrismaInvalidIdError here. */
      if (isPrismaDoesNotExistError(e)) {
        return fieldErrors.addDoesNotExist("school", "The school does not exist.").json;
      }
      throw e;
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

    return convertToPlainObject(education);
  });
};
