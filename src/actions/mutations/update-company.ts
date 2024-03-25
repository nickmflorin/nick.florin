"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { prisma, isPrismaDoesNotExistError, isPrismaInvalidIdError } from "~/prisma/client";
import { type Company } from "~/prisma/model";
import { ApiClientFormError, ApiClientGlobalError, ApiClientFieldErrorCodes } from "~/api";

import { CompanySchema } from "../schemas";

const UpdateCompanySchema = CompanySchema.partial();

export const updateCompany = async (id: string, req: z.infer<typeof CompanySchema>) => {
  const user = await getAuthAdminUser();

  return await prisma.$transaction(async tx => {
    const parsed = UpdateCompanySchema.safeParse(req);
    if (!parsed.success) {
      return ApiClientFormError.BadRequest(parsed.error, UpdateCompanySchema).toJson();
    }
    let co: Company;
    try {
      co = await tx.company.findUniqueOrThrow({
        where: { id },
      });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        return ApiClientGlobalError.NotFound().toJson();
      }
      throw e;
    }
    const { name, shortName, ...data } = parsed.data;

    if (name && (await prisma.company.count({ where: { name, id: { notIn: [co.id] } } }))) {
      return ApiClientFormError.BadRequest({
        name: {
          code: ApiClientFieldErrorCodes.unique,
          message: "The 'name' must be unique for a given company.",
        },
      }).toJson();
    } else if (
      shortName &&
      (await prisma.company.count({ where: { shortName, id: { notIn: [co.id] } } }))
    ) {
      return ApiClientFormError.BadRequest({
        shortName: {
          code: ApiClientFieldErrorCodes.unique,
          message: "The 'shortName' must be unique for a given company.",
        },
      }).toJson();
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
    revalidatePath("/api/companies");
    revalidatePath(`/api/companies/${updated.id}`);
    return updated;
  });
};
