"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server";
import { prisma } from "~/prisma/client";

import { ApiClientFieldErrors } from "~/api";
import { SchoolSchema } from "~/api/schemas";
import { convertToPlainObject } from "~/api/serialization";

export const createSchool = async (req: z.infer<typeof SchoolSchema>) => {
  const { user } = await getAuthedUser();

  const parsed = SchoolSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFieldErrors.fromZodError(parsed.error, SchoolSchema).json;
  }

  const { name, shortName, ...data } = parsed.data;

  const fieldErrors = new ApiClientFieldErrors();
  if (await prisma.school.count({ where: { name } })) {
    fieldErrors.addUnique("name", "The 'name' must be unique for a given school.");
  }
  if (await prisma.school.count({ where: { shortName } })) {
    fieldErrors.addUnique("shortName", "The 'shortName' must be unique for a given school.");
  }
  if (fieldErrors.hasErrors) {
    return fieldErrors.json;
  }
  const school = await prisma.school.create({
    data: {
      ...data,
      name,
      shortName,
      createdById: user.id,
      updatedById: user.id,
    },
  });

  return convertToPlainObject(school);
};
