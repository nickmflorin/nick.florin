"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { isPrismaDoesNotExistError, prisma } from "~/prisma/client";
import { type Company } from "~/prisma/model";
import { ApiClientFormError, ApiClientFieldErrorCodes } from "~/http";

import { ExperienceSchema } from "../schemas";

export const createExperience = async (req: z.infer<typeof ExperienceSchema>) => {
  const user = await getAuthAdminUser();

  const parsed = ExperienceSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFormError.BadRequest(parsed.error, ExperienceSchema).toJson();
  }

  const { company: companyId, ...data } = parsed.data;

  let company: Company;
  try {
    company = await prisma.company.findUniqueOrThrow({ where: { id: companyId } });
  } catch (e) {
    /* Note: We are already guaranteed to be dealing with UUIDs due to the Zod schema check, so
       we do not need to worry about checking isPrismaInvalidIdError here. */
    if (isPrismaDoesNotExistError(e)) {
      throw ApiClientFormError.BadRequest({
        company: {
          code: ApiClientFieldErrorCodes.does_not_exist,
          message: "The company does not exist.",
        },
      });
    }
    throw e;
  }

  if (await prisma.experience.count({ where: { companyId: company.id, title: data.title } })) {
    return ApiClientFormError.BadRequest({
      title: {
        code: ApiClientFieldErrorCodes.unique,
        message: "The 'title' must be unique for a given company.",
      },
    }).toJson();
  } else if (
    data.shortTitle &&
    (await prisma.experience.count({
      where: { companyId: company.id, shortTitle: data.shortTitle },
    }))
  ) {
    return ApiClientFormError.BadRequest({
      shortTitle: {
        code: ApiClientFieldErrorCodes.unique,
        message: "The 'shortTitle' must be unique for a given company.",
      },
    }).toJson();
  }

  const experience = await prisma.experience.create({
    data: {
      ...data,
      companyId: company.id,
      createdById: user.id,
      updatedById: user.id,
    },
  });
  revalidatePath("/admin/experiences", "page");
  revalidatePath("/api/experiences");
  return experience;
};
