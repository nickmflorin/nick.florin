"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { isPrismaDoesNotExistError, prisma } from "~/prisma/client";
import { type Company } from "~/prisma/model";
import { ApiClientFieldErrors } from "~/api";
import { ExperienceSchema } from "~/api/schemas";

export const createExperience = async (req: z.infer<typeof ExperienceSchema>) => {
  const user = await getAuthAdminUser();

  const parsed = ExperienceSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFieldErrors.fromZodError(parsed.error, ExperienceSchema).json;
  }

  const { company: companyId, ...data } = parsed.data;

  let company: Company;
  try {
    company = await prisma.company.findUniqueOrThrow({ where: { id: companyId } });
  } catch (e) {
    /* Note: We are already guaranteed to be dealing with UUIDs due to the Zod schema check, so
       we do not need to worry about checking isPrismaInvalidIdError here. */
    if (isPrismaDoesNotExistError(e)) {
      return ApiClientFieldErrors.doesNotExist("company", "The company does not exist.").json;
    }
    throw e;
  }

  const fieldErrors = new ApiClientFieldErrors();

  if (await prisma.experience.count({ where: { companyId: company.id, title: data.title } })) {
    fieldErrors.addUnique("title", "The 'title' must be unique for a given company.");
  }
  if (
    data.shortTitle &&
    (await prisma.experience.count({
      where: { companyId: company.id, shortTitle: data.shortTitle },
    }))
  ) {
    fieldErrors.addUnique("shortTitle", "The 'shortTitle' must be unique for a given company.");
  }
  if (fieldErrors.hasErrors) {
    return fieldErrors.json;
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
