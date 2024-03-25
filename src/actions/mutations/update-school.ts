"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { prisma, isPrismaDoesNotExistError, isPrismaInvalidIdError } from "~/prisma/client";
import { type School } from "~/prisma/model";
import { ApiClientFormError, ApiClientGlobalError, ApiClientFieldErrorCodes } from "~/api";

import { SchoolSchema } from "../schemas";

const UpdateSchoolSchema = SchoolSchema.partial();

export const updateSchool = async (id: string, req: z.infer<typeof SchoolSchema>) => {
  const user = await getAuthAdminUser();

  return await prisma.$transaction(async tx => {
    const parsed = UpdateSchoolSchema.safeParse(req);
    if (!parsed.success) {
      return ApiClientFormError.BadRequest(parsed.error, UpdateSchoolSchema).toJson();
    }
    let co: School;
    try {
      co = await tx.school.findUniqueOrThrow({
        where: { id },
      });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        return ApiClientGlobalError.NotFound().toJson();
      }
      throw e;
    }
    const { name, shortName, ...data } = parsed.data;

    if (name && (await prisma.school.count({ where: { name, id: { notIn: [co.id] } } }))) {
      return ApiClientFormError.BadRequest({
        name: {
          code: ApiClientFieldErrorCodes.unique,
          message: "The 'name' must be unique for a given school.",
        },
      }).toJson();
    } else if (
      shortName &&
      (await prisma.school.count({ where: { shortName, id: { notIn: [co.id] } } }))
    ) {
      return ApiClientFormError.BadRequest({
        shortName: {
          code: ApiClientFieldErrorCodes.unique,
          message: "The 'shortName' must be unique for a given school.",
        },
      }).toJson();
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
