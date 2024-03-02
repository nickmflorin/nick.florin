"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { ApiClientError, ApiClientFieldErrorCodes } from "~/application/errors";
import { isPrismaDoesNotExistError, prisma } from "~/prisma/client";
import { type School } from "~/prisma/model";

import { EducationSchema } from "./schemas";

export const createEducation = async (req: z.infer<typeof EducationSchema>) => {
  const user = await getAuthAdminUser();

  const parsed = EducationSchema.safeParse(req);
  if (!parsed.success) {
    throw ApiClientError.BadRequest(parsed.error, EducationSchema);
  }

  const { school: schoolId, ...data } = parsed.data;

  let school: School;
  try {
    school = await prisma.school.findUniqueOrThrow({ where: { id: schoolId } });
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

  if (await prisma.education.count({ where: { schoolId: school.id, major: data.major } })) {
    return ApiClientError.BadRequest({
      title: {
        code: ApiClientFieldErrorCodes.unique,
        message: "The 'major' must be unique for a given school.",
      },
    }).toResponse();
  } else if (
    data.shortMajor &&
    (await prisma.education.count({
      where: { schoolId: school.id, shortMajor: data.shortMajor },
    }))
  ) {
    return ApiClientError.BadRequest({
      shortMajor: {
        code: ApiClientFieldErrorCodes.unique,
        message: "The 'shortMajor' must be unique for a given school.",
      },
    }).toResponse();
  }

  const education = await prisma.education.create({
    data: {
      ...data,
      schoolId: school.id,
      createdById: user.id,
      updatedById: user.id,
    },
  });
  revalidatePath("/admin/educations", "page");
  revalidatePath("/api/educations");
  return education;
};
