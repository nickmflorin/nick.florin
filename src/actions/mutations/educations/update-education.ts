"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server";
import { type School } from "~/database/model";
import { calculateSkillsExperience } from "~/database/model";
import { prisma } from "~/database/prisma";

import { queryM2MsDynamically } from "~/actions/mutations/m2ms";
import { EducationSchema } from "~/actions-v2/schemas";
import { ApiClientFieldErrors, ApiClientGlobalError } from "~/api";
import { convertToPlainObject } from "~/api/serialization";

const UpdateEducationSchema = EducationSchema.partial();

export const updateEducation = async (id: string, req: z.infer<typeof UpdateEducationSchema>) => {
  const { user } = await getAuthedUser();

  const parsed = UpdateEducationSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFieldErrors.fromZodError(parsed.error, UpdateEducationSchema).json;
  }

  const { school: schoolId, major, skills: _skills, ...data } = parsed.data;
  const fieldErrors = new ApiClientFieldErrors();

  return await prisma.$transaction(async tx => {
    const education = await tx.education.findUniqueOrThrow({
      where: { id },
      include: { school: true, skills: true },
    });
    if (!education) {
      throw ApiClientGlobalError.NotFound();
    }
    let school: School = education.school;
    if (schoolId) {
      /* Note: We are already guaranteed to be dealing with UUIDs due to the Zod schema check, so
         we do not need to worry about checking isPrismaInvalidIdError here. */
      const s = await tx.school.findUnique({ where: { id: schoolId } });
      if (!s) {
        return ApiClientFieldErrors.doesNotExist("school", "The school does not exist.").json;
      }
      school = s;
    }
    if (
      major &&
      (await prisma.education.count({
        where: { schoolId: school.id, major, id: { notIn: [education.id] } },
      }))
    ) {
      fieldErrors.addUnique("major", "The 'major' must be unique for a given school.");
    }
    if (
      data.shortMajor &&
      (await prisma.education.count({
        where: { schoolId: school.id, shortMajor: data.shortMajor, id: { notIn: [education.id] } },
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
    const sks = [...education.skills.map(sk => sk.id), ...(skills ?? []).map(sk => sk.id)];
    let updateData = {
      ...data,
      major,
      schoolId: school.id,
      updatedById: user.id,
      skills: skills ? { set: skills.map(skill => ({ id: skill.id })) } : undefined,
    };
    if (updateData.visible === false && updateData.highlighted === undefined) {
      updateData = { ...updateData, highlighted: false };
    } else if (updateData.highlighted === true && updateData.visible === undefined) {
      updateData = { ...updateData, visible: true };
    }
    const updated = await tx.education.update({
      where: { id },
      data: updateData,
    });
    await calculateSkillsExperience(tx, sks, { user });
    return convertToPlainObject(updated);
  });
};
