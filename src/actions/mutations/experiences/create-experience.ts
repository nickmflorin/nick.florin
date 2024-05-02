"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server";
import { isPrismaDoesNotExistError, prisma } from "~/prisma/client";
import { type Company } from "~/prisma/model";
import { queryM2MsDynamically } from "~/actions/mutations/m2ms";
import { ApiClientFieldErrors } from "~/api";
import { ExperienceSchema } from "~/api/schemas";
import { convertToPlainObject } from "~/api/serialization";

export const createExperience = async (req: z.infer<typeof ExperienceSchema>) => {
  const { user } = await getAuthedUser();

  const parsed = ExperienceSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFieldErrors.fromZodError(parsed.error, ExperienceSchema).json;
  }

  const { company: companyId, skills: _skills, ...data } = parsed.data;

  return await prisma.$transaction(async tx => {
    let company: Company;
    try {
      company = await tx.company.findUniqueOrThrow({ where: { id: companyId } });
    } catch (e) {
      /* Note: We are already guaranteed to be dealing with UUIDs due to the Zod schema check, so
       we do not need to worry about checking isPrismaInvalidIdError here. */
      if (isPrismaDoesNotExistError(e)) {
        return ApiClientFieldErrors.doesNotExist("company", "The company does not exist.").json;
      }
      throw e;
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

    return convertToPlainObject(experience);
  });
};
