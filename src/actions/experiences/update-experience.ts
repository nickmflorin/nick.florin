"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server-v2";
import { type BrandExperience, calculateSkillsExperience, type Company } from "~/database/model";
import { db } from "~/database/prisma";

import { type MutationActionResponse } from "~/actions";
import { queryM2MsDynamically } from "~/actions/m2ms";
import { ExperienceSchema } from "~/actions/schemas";
import {
  ApiClientFieldErrors,
  ApiClientGlobalError,
  ApiClientFormError,
  convertToPlainObject,
} from "~/api";

const UpdateExperienceSchema = ExperienceSchema.partial();

export const updateExperience = async (
  experienceId: string,
  data: z.infer<typeof UpdateExperienceSchema>,
): Promise<MutationActionResponse<BrandExperience>> => {
  const { user, error, isAdmin } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }

  const experience = await db.experience.findUnique({
    where: { id: experienceId },
    include: { company: true, skills: true },
  });
  if (!experience) {
    return { error: ApiClientGlobalError.NotFound({}).json };
  }
  const parsed = UpdateExperienceSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: ApiClientFormError.fromZodError({ error: parsed.error }).json,
    };
  }

  const { company: companyId, title, skills: _skills, ...rest } = parsed.data;
  const fieldErrors = new ApiClientFieldErrors();

  let company: Company = experience.company;
  if (companyId) {
    /* Note: We are already guaranteed to be dealing with UUIDs due to the Zod schema check, so
       we do not need to worry about checking isPrismaInvalidIdError here. */
    const c = await db.company.findUnique({ where: { id: companyId } });
    if (!c) {
      return {
        error: ApiClientFieldErrors.doesNotExist("company", "The company does not exist.").json,
      };
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
    rest.shortTitle &&
    (await db.experience.count({
      where: {
        companyId: company.id,
        shortTitle: rest.shortTitle,
        id: { notIn: [experience.id] },
      },
    }))
  ) {
    fieldErrors.addUnique("shortTitle", "The 'shortTitle' must be unique for a given company.");
  }

  const [skills] = await queryM2MsDynamically(db, {
    model: "skill",
    ids: _skills,
    fieldErrors,
  });

  if (fieldErrors.hasErrors) {
    return { error: fieldErrors.json };
  }
  const sks = [...experience.skills.map(sk => sk.id), ...(skills ?? []).map(sk => sk.id)];
  let updateData = {
    ...rest,
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
  return await db.$transaction(async tx => {
    const updated = await tx.experience.update({
      where: { id: experience.id },
      data: updateData,
      include: { company: true },
    });
    await calculateSkillsExperience(tx, sks, { user });
    return { data: convertToPlainObject(updated) };
  });
};
