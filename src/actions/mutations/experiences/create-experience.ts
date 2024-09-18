"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server";
import { calculateSkillsExperience } from "~/database/model";
import { db } from "~/database/prisma";
import { logger } from "~/internal/logger";

import { queryM2MsDynamically } from "~/actions/mutations/m2ms";
import { ExperienceSchema } from "~/actions-v2/schemas";
import { ApiClientFieldErrors } from "~/api";
import { convertToPlainObject } from "~/api/serialization";

export const createExperience = async (req: z.infer<typeof ExperienceSchema>) => {
  const { user } = await getAuthedUser();

  const parsed = ExperienceSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFieldErrors.fromZodError(parsed.error, ExperienceSchema).json;
  }

  const { company: companyId, skills: _skills, ...data } = parsed.data;

  return await db.$transaction(async tx => {
    /* Note: We are already guaranteed to be dealing with UUIDs due to the Zod schema check, so
       we do not need to worry about checking isPrismaInvalidIdError here. */
    const company = await tx.company.findUnique({ where: { id: companyId } });
    if (!company) {
      return ApiClientFieldErrors.doesNotExist("company", "The company does not exist.").json;
    }

    const fieldErrors = new ApiClientFieldErrors();

    if (await tx.experience.count({ where: { companyId: company.id, title: data.title } })) {
      fieldErrors.addUnique("title", "The 'title' must be unique for a given company.");
    }
    if (
      data.shortTitle &&
      (await tx.experience.count({
        where: { companyId: company.id, shortTitle: data.shortTitle },
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

    const experience = await tx.experience.create({
      data: {
        ...data,
        companyId: company.id,
        createdById: user.id,
        updatedById: user.id,
        skills: skills ? { connect: skills.map(skill => ({ id: skill.id })) } : undefined,
      },
    });

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
    return convertToPlainObject(experience);
  });
};
