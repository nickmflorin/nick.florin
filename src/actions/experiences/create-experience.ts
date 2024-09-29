"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server-v2";
import { type BrandExperience } from "~/database/model";
import { calculateSkillsExperience } from "~/database/model";
import { db } from "~/database/prisma";
import { logger } from "~/internal/logger";

import { type MutationActionResponse } from "~/actions";
import { queryM2MsDynamically } from "~/actions/m2ms";
import { ExperienceSchema } from "~/actions/schemas";
import {
  ApiClientFieldErrors,
  ApiClientGlobalError,
  ApiClientFormError,
  convertToPlainObject,
} from "~/api";

export const createExperience = async (
  data: z.infer<typeof ExperienceSchema>,
): Promise<MutationActionResponse<BrandExperience>> => {
  const { user, error, isAdmin } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }

  const parsed = ExperienceSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: ApiClientFormError.fromZodError({ error: parsed.error }).json,
    };
  }

  const { company: companyId, skills: _skills, ...rest } = parsed.data;

  /* Note: We are already guaranteed to be dealing with UUIDs due to the Zod schema check, so
       we do not need to worry about checking isPrismaInvalidIdError here. */
  const company = await db.company.findUnique({ where: { id: companyId } });
  if (!company) {
    return {
      error: ApiClientFieldErrors.doesNotExist("company", "The company does not exist.").json,
    };
  }

  const fieldErrors = new ApiClientFieldErrors();

  if (await db.experience.count({ where: { companyId: company.id, title: data.title } })) {
    fieldErrors.addUnique("title", "The 'title' must be unique for a given company.");
  }
  if (
    data.shortTitle &&
    (await db.experience.count({
      where: { companyId: company.id, shortTitle: data.shortTitle },
    }))
  ) {
    fieldErrors.addUnique("shortTitle", "The 'shortTitle' must be unique for a given company.");
  }

  const [skills] = await queryM2MsDynamically(db, {
    model: "skill",
    ids: _skills,
    fieldErrors,
  });

  if (!fieldErrors.isEmpty) {
    return { error: fieldErrors.json };
  }

  let createData = {
    ...rest,
    companyId: company.id,
    createdById: user.id,
    updatedById: user.id,
    skills: skills ? { connect: skills.map(skill => ({ id: skill.id })) } : undefined,
  };
  if (createData.visible === false && createData.highlighted === undefined) {
    createData = { ...createData, highlighted: false };
  } else if (createData.highlighted === true && createData.visible === undefined) {
    createData = { ...createData, visible: true };
  }

  return await db.$transaction(async tx => {
    const experience = await tx.experience.create({ data: createData, include: { company: true } });

    if (skills && skills.length !== 0) {
      logger.info(
        `Recalculating experience for ${skills.length} skill(s) associated with new experience, ` +
          `'${experience.title}'.`,
        { experienceId: experience.id, skills: skills.map(s => s.id) },
      );
      await calculateSkillsExperience(
        tx,
        skills.map(sk => sk.id),
        { user },
      );
      logger.info(
        `Successfully recalculated experience for ${skills.length} skill(s) associated with ` +
          `new experience, '${experience.title}'.`,
        { experienceId: experience.id, skills: skills.map(s => s.id) },
      );
    }
    return { data: convertToPlainObject(experience) };
  });
};
