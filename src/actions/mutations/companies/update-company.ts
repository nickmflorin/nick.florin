"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server";
import { type Company } from "~/database/model";
import { prisma, isPrismaDoesNotExistError, isPrismaInvalidIdError } from "~/database/prisma";

import { CompanySchema } from "~/actions-v2/schemas";
import { ApiClientFieldErrors, ApiClientGlobalError } from "~/api";
import { convertToPlainObject } from "~/api/serialization";

const UpdateCompanySchema = CompanySchema.partial();

export const updateCompany = async (id: string, req: z.infer<typeof CompanySchema>) => {
  const { user } = await getAuthedUser();
  const parsed = UpdateCompanySchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFieldErrors.fromZodError(parsed.error, UpdateCompanySchema).json;
  }
  return await prisma.$transaction(async tx => {
    let co: Company;
    try {
      co = await tx.company.findUniqueOrThrow({
        where: { id },
      });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        throw ApiClientGlobalError.NotFound();
      }
      throw e;
    }
    const { name, shortName, ...data } = parsed.data;

    const fieldErrors = new ApiClientFieldErrors();

    if (name && (await prisma.company.count({ where: { name, id: { notIn: [co.id] } } }))) {
      fieldErrors.addUnique(name, "The 'name' must be unique for a given company.");
    } else if (
      shortName &&
      (await prisma.company.count({ where: { shortName, id: { notIn: [co.id] } } }))
    ) {
      fieldErrors.addUnique(shortName, "The 'shortName' must be unique for a given company.");
    }
    if (fieldErrors.hasErrors) {
      return fieldErrors.json;
    }
    const updated = await prisma.company.update({
      where: { id },
      data: {
        ...data,
        name,
        shortName,
        createdById: user.id,
        updatedById: user.id,
      },
    });
    return convertToPlainObject(updated);
  });
};
