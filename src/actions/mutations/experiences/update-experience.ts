"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { type Experience, type Company, type ApiExperience } from "~/prisma/model";
import { ApiClientFieldErrors, ApiClientGlobalError, type ApiClientErrorJson } from "~/api";
import { ExperienceSchema } from "~/api/schemas";

const UpdateExperienceSchema = ExperienceSchema.partial();

export const updateExperience = async (
  id: string,
  req: z.infer<typeof UpdateExperienceSchema>,
): Promise<ApiClientErrorJson<keyof (typeof UpdateExperienceSchema)["shape"]> | Experience> => {
  const user = await getAuthAdminUser();

  const parsed = UpdateExperienceSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFieldErrors.fromZodError(parsed.error, ExperienceSchema).json;
  }

  const { company: companyId, title, ...data } = parsed.data;
  const fieldErrors = new ApiClientFieldErrors();

  const experience = await prisma.$transaction(async tx => {
    let exp: ApiExperience;
    try {
      exp = await tx.experience.findUniqueOrThrow({
        where: { id },
        include: { company: true },
      });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        throw ApiClientGlobalError.NotFound();
      }
      throw e;
    }
    let company: Company = exp.company;
    if (companyId) {
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
    }
    if (
      title &&
      (await prisma.experience.count({
        where: { companyId: company.id, title, id: { notIn: [exp.id] } },
      }))
    ) {
      fieldErrors.addUnique("title", "The title must be unique for a given company.");
    }
    if (
      data.shortTitle &&
      (await prisma.experience.count({
        where: { companyId: company.id, shortTitle: data.shortTitle, id: { notIn: [exp.id] } },
      }))
    ) {
      fieldErrors.addUnique("shortTitle", "The 'shortTitle' must be unique for a given company.");
    }
    if (fieldErrors.hasErrors) {
      return fieldErrors.json;
    }
    return await tx.experience.update({
      where: { id },
      data: {
        ...data,
        title,
        companyId: company.id,
        updatedById: user.id,
      },
    });
  });
  revalidatePath("/admin/experiences", "page");
  revalidatePath("/api/experiences");
  return experience;
};
