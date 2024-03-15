"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { type Experience } from "~/prisma/model";
import { ApiClientError, ApiClientFieldErrorCodes } from "~/api";

import { ExperienceSchema } from "./schemas";

const UpdateExperienceSchema = ExperienceSchema.partial();

export const updateExperience = async (id: string, req: z.infer<typeof UpdateExperienceSchema>) => {
  const user = await getAuthAdminUser();

  const parsed = UpdateExperienceSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientError.BadRequest(parsed.error, ExperienceSchema).toJson();
  }

  const { company: companyId, title, ...data } = parsed.data;

  const experience = await prisma.$transaction(async tx => {
    let exp: Experience;
    try {
      exp = await tx.experience.findUniqueOrThrow({
        where: { id },
      });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        throw ApiClientError.NotFound();
      }
      throw e;
    }
    if (companyId) {
      try {
        await tx.company.findUniqueOrThrow({ where: { id: companyId } });
      } catch (e) {
        /* Note: We are already guaranteed to be dealing with UUIDs due to the Zod schema check, so
        we do not need to worry about checking isPrismaInvalidIdError here. */
        if (isPrismaDoesNotExistError(e)) {
          throw ApiClientError.BadRequest({
            company: {
              code: ApiClientFieldErrorCodes.does_not_exist,
              message: "The company does not exist.",
            },
          });
        }
        throw e;
      }
    }
    if (
      title &&
      (await prisma.experience.count({ where: { companyId, title, id: { notIn: [exp.id] } } }))
    ) {
      return ApiClientError.BadRequest({
        title: {
          code: ApiClientFieldErrorCodes.unique,
          message: "The title must be unique for a given company.",
        },
      }).toJson();
    } else if (
      data.shortTitle &&
      (await prisma.experience.count({
        where: { companyId, shortTitle: data.shortTitle, id: { notIn: [exp.id] } },
      }))
    ) {
      return ApiClientError.BadRequest({
        shortTitle: {
          code: ApiClientFieldErrorCodes.unique,
          message: "The 'shortTitle' must be unique for a given company.",
        },
      }).toJson();
    }
    return await tx.experience.update({
      where: { id },
      data: {
        ...data,
        title,
        companyId,
        updatedById: user.id,
      },
    });
  });
  revalidatePath("/admin/experiences", "page");
  revalidatePath("/api/experiences");
  return experience;
};
