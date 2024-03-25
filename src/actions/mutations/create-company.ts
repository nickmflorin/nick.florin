"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { prisma } from "~/prisma/client";
import { ApiClientFormError, ApiClientFieldErrorCodes } from "~/api";

import { CompanySchema } from "../schemas";

export const createCompany = async (req: z.infer<typeof CompanySchema>) => {
  const user = await getAuthAdminUser();

  const parsed = CompanySchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFormError.BadRequest(parsed.error, CompanySchema).toJson();
  }

  const { name, shortName, ...data } = parsed.data;

  if (await prisma.company.count({ where: { name } })) {
    return ApiClientFormError.BadRequest({
      name: {
        code: ApiClientFieldErrorCodes.unique,
        message: "The 'name' must be unique for a given company.",
      },
    }).toJson();
  } else if (await prisma.company.count({ where: { shortName } })) {
    return ApiClientFormError.BadRequest({
      shortName: {
        code: ApiClientFieldErrorCodes.unique,
        message: "The 'shortName' must be unique for a given company.",
      },
    }).toJson();
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
  revalidatePath("/api/companies");
  return company;
};
