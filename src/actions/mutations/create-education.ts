"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { isPrismaDoesNotExistError, prisma } from "~/prisma/client";
import { type School } from "~/prisma/model";
import { ApiClientFormError, ApiClientFieldErrorCodes } from "~/api";
import { EducationSchema } from "~/api/schemas";

export const createEducation = async (req: z.infer<typeof EducationSchema>) => {
  const user = await getAuthAdminUser();

  const parsed = EducationSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFormError.BadRequest(parsed.error, EducationSchema).toJson();
  }

  const { school: schoolId, ...data } = parsed.data;

  let school: School;
  try {
    school = await prisma.school.findUniqueOrThrow({ where: { id: schoolId } });
  } catch (e) {
    /* Note: We are already guaranteed to be dealing with UUIDs due to the Zod schema check, so
       we do not need to worry about checking isPrismaInvalidIdError here. */
    if (isPrismaDoesNotExistError(e)) {
      throw ApiClientFormError.BadRequest({
        school: {
          code: ApiClientFieldErrorCodes.does_not_exist,
          message: "The school does not exist.",
        },
      });
    }
    throw e;
  }

  if (await prisma.education.count({ where: { schoolId: school.id, major: data.major } })) {
    return ApiClientFormError.BadRequest({
      major: {
        code: ApiClientFieldErrorCodes.unique,
        message: "The 'major' must be unique for a given school.",
      },
    }).toJson();
  } else if (
    data.shortMajor &&
    (await prisma.education.count({
      where: { schoolId: school.id, shortMajor: data.shortMajor },
    }))
  ) {
    return ApiClientFormError.BadRequest({
      shortMajor: {
        code: ApiClientFieldErrorCodes.unique,
        message: "The 'shortMajor' must be unique for a given school.",
      },
    }).toJson();
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
