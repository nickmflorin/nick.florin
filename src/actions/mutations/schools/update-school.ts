"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server";
import { type School } from "~/database/model";
import { prisma, isPrismaDoesNotExistError, isPrismaInvalidIdError } from "~/database/prisma";

import { SchoolSchema } from "~/actions-v2/schemas";
import { ApiClientFieldErrors, ApiClientGlobalError } from "~/api";
import { convertToPlainObject } from "~/api/serialization";

const UpdateSchoolSchema = SchoolSchema.partial();

export const updateSchool = async (id: string, req: z.infer<typeof SchoolSchema>) => {
  const { user } = await getAuthedUser({ strict: true });

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
        updatedById: user.id,
      },
    });

    return convertToPlainObject(updated);
  });
};
