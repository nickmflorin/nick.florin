"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server";
import { prisma } from "~/prisma/client";
import { ApiClientFieldErrors } from "~/api";
import { CompanySchema } from "~/api/schemas";
import { convertToPlainObject } from "~/api/serialization";

export const createCompany = async (req: z.infer<typeof CompanySchema>) => {
  const { user } = await getAuthedUser();

  const parsed = CompanySchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFieldErrors.fromZodError(parsed.error, CompanySchema).json;
  }

  const fieldErrors = new ApiClientFieldErrors();

  const { name, shortName, ...data } = parsed.data;

  if (await prisma.company.count({ where: { name } })) {
    fieldErrors.addUnique("name", "The 'name' must be unique for a given company.");
  }
  if (await prisma.company.count({ where: { shortName } })) {
    fieldErrors.addUnique("shortName", "The 'shortName' must be unique for a given company.");
  }
  if (fieldErrors.hasErrors) {
    return fieldErrors.json;
  }
  const company = await prisma.company.create({
    data: {
      ...data,
      name,
      shortName,
      createdById: user.id,
      updatedById: user.id,
    },
  });
  return convertToPlainObject(company);
};
