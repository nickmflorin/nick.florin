"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { prisma } from "~/prisma/client";
import { ApiClientFormError, ApiClientFieldErrorCodes } from "~/api";
import { SchoolSchema } from "~/api/schemas";

export const createSchool = async (req: z.infer<typeof SchoolSchema>) => {
  const user = await getAuthAdminUser();

  const parsed = SchoolSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFormError.BadRequest(parsed.error, SchoolSchema).toJson();
  }

  const { name, shortName, ...data } = parsed.data;

  if (await prisma.school.count({ where: { name } })) {
    return ApiClientFormError.BadRequest({
      name: {
        code: ApiClientFieldErrorCodes.unique,
        message: "The 'name' must be unique for a given school.",
      },
    }).toJson();
  } else if (await prisma.school.count({ where: { shortName } })) {
    return ApiClientFormError.BadRequest({
      shortName: {
        code: ApiClientFieldErrorCodes.unique,
        message: "The 'shortName' must be unique for a given school.",
      },
    }).toJson();
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
  revalidatePath("/api/schools");
  return school;
};
