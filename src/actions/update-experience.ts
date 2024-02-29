"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { ApiClientError, ApiClientFieldErrorCodes } from "~/application/errors";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";

import { ExperienceSchema } from "./schemas";

const UpdateExperienceSchema = ExperienceSchema.partial();

export const updateExperience = async (id: string, req: z.infer<typeof UpdateExperienceSchema>) => {
  /* Note: We may want to return the error in the response body in the future, for now this is
     fine - since it is not expected. */
  const user = await getAuthAdminUser();

  const parsed = UpdateExperienceSchema.safeParse(req);
  if (!parsed.success) {
    throw ApiClientError.BadRequest(parsed.error, ExperienceSchema);
  }

  const { company: companyId, title, ...data } = parsed.data;

  const experience = await prisma.$transaction(async tx => {
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
    if (title) {
      if (await prisma.experience.count({ where: { companyId, title } })) {
        return ApiClientError.BadRequest({
          title: {
            code: ApiClientFieldErrorCodes.unique,
            message: "The title must be unique for a given company.",
          },
        }).toResponse();
      }
    }
    try {
      return await tx.experience.update({
        where: { id },
        data: {
          ...data,
          title,
          companyId,
          updatedById: user.id,
        },
      });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        throw ApiClientError.NotFound();
      }
      throw e;
    }
  });
  revalidatePath("/admin/experiences", "page");
  revalidatePath("/api/experiences");
  return experience;
};
