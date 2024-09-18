"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server";
import { type Experience, type Company } from "~/database/model";
import { calculateSkillsExperience } from "~/database/model";
import { db } from "~/database/prisma";

import { queryM2MsDynamically } from "~/actions/mutations/m2ms";
import { ExperienceSchema } from "~/actions-v2/schemas";
import { ApiClientFieldErrors, ApiClientGlobalError, type ApiClientErrorJson } from "~/api";
import { convertToPlainObject } from "~/api/serialization";

const UpdateExperienceSchema = ExperienceSchema.partial();

export const updateExperience = async (
  id: string,
  req: z.infer<typeof UpdateExperienceSchema>,
): Promise<ApiClientErrorJson<keyof (typeof UpdateExperienceSchema)["shape"]> | Experience> => {
  const { user } = await getAuthedUser();

  const parsed = UpdateExperienceSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFieldErrors.fromZodError(parsed.error, ExperienceSchema).json;
  }

  const { company: companyId, title, skills: _skills, ...data } = parsed.data;
  const fieldErrors = new ApiClientFieldErrors();

  return await db.$transaction(async tx => {
    const experience = await tx.experience.findUnique({
      where: { id },
      include: { company: true, skills: true },
    });
    if (!experience) {
      throw ApiClientGlobalError.NotFound();
    }
    let company: Company = experience.company;
    if (companyId) {
      /* Note: We are already guaranteed to be dealing with UUIDs due to the Zod schema check, so
         we do not need to worry about checking isPrismaInvalidIdError here. */
      const c = await tx.company.findUnique({ where: { id: companyId } });
      if (!c) {
        return ApiClientFieldErrors.doesNotExist("company", "The company does not exist.").json;
      }
      company = c;
    }
    if (
      title &&
      (await db.experience.count({
        where: { companyId: company.id, title, id: { notIn: [experience.id] } },
      }))
    ) {
      fieldErrors.addUnique("title", "The title must be unique for a given company.");
    }
    if (
      data.shortTitle &&
      (await db.experience.count({
        where: {
          companyId: company.id,
          shortTitle: data.shortTitle,
          id: { notIn: [experience.id] },
        },
      }))
    ) {
      fieldErrors.addUnique("shortTitle", "The 'shortTitle' must be unique for a given company.");
    }

    const [skills] = await queryM2MsDynamically(tx, {
      model: "skill",
      ids: _skills,
      fieldErrors,
    });

    if (fieldErrors.hasErrors) {
      return fieldErrors.json;
    }
    const sks = [...experience.skills.map(sk => sk.id), ...(skills ?? []).map(sk => sk.id)];
    let updateData = {
      ...data,
      title,
      companyId: company.id,
      updatedById: user.id,
      skills: skills ? { set: skills.map(skill => ({ id: skill.id })) } : undefined,
    };
    if (updateData.visible === false && updateData.highlighted === undefined) {
      updateData = { ...updateData, highlighted: false };
    } else if (updateData.highlighted === true && updateData.visible === undefined) {
      updateData = { ...updateData, visible: true };
    }
    const updated = await tx.experience.update({
      where: { id },
      data: updateData,
    });
    await calculateSkillsExperience(tx, sks, { user });
    return convertToPlainObject(updated);
  });
};
