"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { ApiClientError, ApiClientFieldErrorCodes } from "~/application/errors";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";

import { EducationSchema } from "./schemas";

const UpdateEducationSchema = EducationSchema.partial();

export const updateEducation = async (id: string, req: z.infer<typeof UpdateEducationSchema>) => {
  const user = await getAuthAdminUser();

  const parsed = UpdateEducationSchema.safeParse(req);
  if (!parsed.success) {
    throw ApiClientError.BadRequest(parsed.error, UpdateEducationSchema);
  }

  const { school: schoolId, major, ...data } = parsed.data;

  const education = await prisma.$transaction(async tx => {
    if (schoolId) {
      try {
        await tx.school.findUniqueOrThrow({ where: { id: schoolId } });
      } catch (e) {
        /* Note: We are already guaranteed to be dealing with UUIDs due to the Zod schema check, so
        we do not need to worry about checking isPrismaInvalidIdError here. */
        if (isPrismaDoesNotExistError(e)) {
          throw ApiClientError.BadRequest({
            company: {
              code: ApiClientFieldErrorCodes.does_not_exist,
              message: "The school does not exist.",
            },
          });
        }
        throw e;
      }
    }
    if (major) {
      if (await prisma.education.count({ where: { schoolId, major } })) {
        return ApiClientError.BadRequest({
          major: {
            code: ApiClientFieldErrorCodes.unique,
            message: "The major must be unique for a given school.",
          },
        }).toResponse();
      }
    }
    try {
      return await tx.education.update({
        where: { id },
        data: {
          ...data,
          major,
          schoolId,
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
  revalidatePath("/admin/educations", "page");
  revalidatePath("/api/educations");
  return education;
};
