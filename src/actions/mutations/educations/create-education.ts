"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { isPrismaDoesNotExistError, prisma } from "~/prisma/client";
import { type School } from "~/prisma/model";
import { ApiClientFieldErrors } from "~/api";
import { EducationSchema } from "~/api/schemas";
import { convertToPlainObject } from "~/api/serialization";

export const createEducation = async (req: z.infer<typeof EducationSchema>) => {
  const user = await getAuthAdminUser();

  const parsed = EducationSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFieldErrors.fromZodError(parsed.error, EducationSchema).json;
  }

  const { school: schoolId, ...data } = parsed.data;
  const fieldErrors = new ApiClientFieldErrors();

  let school: School;
  try {
    school = await prisma.school.findUniqueOrThrow({ where: { id: schoolId } });
  } catch (e) {
    /* Note: We are already guaranteed to be dealing with UUIDs due to the Zod schema check, so
       we do not need to worry about checking isPrismaInvalidIdError here. */
    if (isPrismaDoesNotExistError(e)) {
      return fieldErrors.addDoesNotExist("school", "The school does not exist.").json;
    }
    throw e;
  }

  if (await prisma.education.count({ where: { schoolId: school.id, major: data.major } })) {
    fieldErrors.addUnique("major", "The 'major' must be unique for a given school.");
  }
  if (
    data.shortMajor &&
    (await prisma.education.count({
      where: { schoolId: school.id, shortMajor: data.shortMajor },
    }))
  ) {
    fieldErrors.addUnique("shortMajor", "The 'shortMajor' must be unique for a given school.");
  }
  if (fieldErrors.hasErrors) {
    return fieldErrors.json;
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
  return convertToPlainObject(education);
};
