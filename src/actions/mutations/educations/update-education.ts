"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { type ApiEducation, type School } from "~/prisma/model";
import { ApiClientFieldErrors, ApiClientGlobalError } from "~/api";
import { EducationSchema } from "~/api/schemas";
import { convertToPlainObject } from "~/api/serialization";

const UpdateEducationSchema = EducationSchema.partial();

export const updateEducation = async (id: string, req: z.infer<typeof UpdateEducationSchema>) => {
  const user = await getAuthAdminUser();

  const parsed = UpdateEducationSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFieldErrors.fromZodError(parsed.error, UpdateEducationSchema).json;
  }

  const { school: schoolId, major, ...data } = parsed.data;
  const fieldErrors = new ApiClientFieldErrors();

  const education = await prisma.$transaction(async tx => {
    let edu: ApiEducation;
    try {
      edu = await tx.education.findUniqueOrThrow({
        where: { id },
        include: { school: true },
      });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        throw ApiClientGlobalError.NotFound();
      }
      throw e;
    }
    let school: School = edu.school;
    if (schoolId) {
      try {
        school = await tx.school.findUniqueOrThrow({ where: { id: schoolId } });
      } catch (e) {
        /* Note: We are already guaranteed to be dealing with UUIDs due to the Zod schema check, so
        we do not need to worry about checking isPrismaInvalidIdError here. */
        if (isPrismaDoesNotExistError(e)) {
          return ApiClientFieldErrors.doesNotExist("school", "The school does not exist.").json;
        } else {
          throw e;
        }
      }
    }
    if (
      major &&
      (await prisma.education.count({
        where: { schoolId: school.id, major, id: { notIn: [edu.id] } },
      }))
    ) {
      fieldErrors.addUnique("major", "The 'major' must be unique for a given school.");
    }
    if (
      data.shortMajor &&
      (await prisma.education.count({
        where: { schoolId: school.id, shortMajor: data.shortMajor, id: { notIn: [edu.id] } },
      }))
    ) {
      fieldErrors.addUnique("shortMajor", "The 'shortMajor' must be unique for a given school.");
    }
    if (fieldErrors.hasErrors) {
      return fieldErrors.json;
    }
    return await tx.education.update({
      where: { id },
      data: {
        ...data,
        major,
        schoolId: school.id,
        updatedById: user.id,
      },
    });
  });
  revalidatePath("/admin/educations", "page");
  revalidatePath("/api/educations");
  return convertToPlainObject(education);
};
