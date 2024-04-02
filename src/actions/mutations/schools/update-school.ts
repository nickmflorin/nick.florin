"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { prisma, isPrismaDoesNotExistError, isPrismaInvalidIdError } from "~/prisma/client";
import { type School } from "~/prisma/model";
import { ApiClientFieldErrors, ApiClientGlobalError } from "~/api";
import { SchoolSchema } from "~/api/schemas";

const UpdateSchoolSchema = SchoolSchema.partial();

export const updateSchool = async (id: string, req: z.infer<typeof SchoolSchema>) => {
  const user = await getAuthAdminUser();

  return await prisma.$transaction(async tx => {
    let co: School;
    try {
      co = await tx.school.findUniqueOrThrow({
        where: { id },
      });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        throw ApiClientGlobalError.NotFound();
      }
      throw e;
    }
    const parsed = UpdateSchoolSchema.safeParse(req);
    if (!parsed.success) {
      return ApiClientFieldErrors.fromZodError(parsed.error, UpdateSchoolSchema).json;
    }
    const { name, shortName, ...data } = parsed.data;
    const fieldErrors = new ApiClientFieldErrors();

    if (name && (await prisma.school.count({ where: { name, id: { notIn: [co.id] } } }))) {
      fieldErrors.addUnique("name", "The 'name' must be unique for a given school.");
    }
    if (
      shortName &&
      (await prisma.school.count({ where: { shortName, id: { notIn: [co.id] } } }))
    ) {
      fieldErrors.addUnique("shortName", "The 'shortName' must be unique for a given school.");
    }
    const updated = await prisma.school.update({
      where: { id },
      data: {
        ...data,
        name,
        shortName,
        createdById: user.id,
        updatedById: user.id,
      },
    });
    revalidatePath("/api/schools");
    revalidatePath(`/api/schools/${updated.id}`);
    return updated;
  });
};
