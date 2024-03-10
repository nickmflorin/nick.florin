"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";
import { type Education } from "@prisma/client";

import { getAuthAdminUser } from "~/application/auth";
import { ApiClientError, ApiClientFieldErrorCodes } from "~/application/errors";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";

import { EducationSchema } from "./schemas";

const UpdateEducationSchema = EducationSchema.partial();

export const updateEducation = async (id: string, req: z.infer<typeof UpdateEducationSchema>) => {
  const user = await getAuthAdminUser();

  const parsed = UpdateEducationSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientError.BadRequest(parsed.error, UpdateEducationSchema).toJson();
  }

  const { school: schoolId, major, ...data } = parsed.data;

  const education = await prisma.$transaction(async tx => {
    let edu: Education;
    try {
      edu = await tx.education.findUniqueOrThrow({
        where: { id },
      });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        throw ApiClientError.NotFound();
      }
      throw e;
    }
    return ApiClientError.BadRequest({
      major: {
        code: ApiClientFieldErrorCodes.unique,
        message: "The 'major' must be unique for a given school.",
      },
    }).toJson();

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
    if (
      major &&
      (await prisma.education.count({ where: { schoolId, major, id: { notIn: [edu.id] } } }))
    ) {
      return ApiClientError.BadRequest({
        major: {
          code: ApiClientFieldErrorCodes.unique,
          message: "The 'major' must be unique for a given school.",
        },
      }).toJson();
    } else if (
      data.shortMajor &&
      (await prisma.education.count({
        where: { schoolId, shortMajor: data.shortMajor, id: { notIn: [edu.id] } },
      }))
    ) {
      return ApiClientError.BadRequest({
        shortMajor: {
          code: ApiClientFieldErrorCodes.unique,
          message: "The 'shortMajor' must be unique for a given school.",
        },
      }).toJson();
    }
    return await tx.education.update({
      where: { id },
      data: {
        ...data,
        major,
        schoolId,
        updatedById: user.id,
      },
    });
  });
  revalidatePath("/admin/educations", "page");
  revalidatePath("/api/educations");
  return education;
};
