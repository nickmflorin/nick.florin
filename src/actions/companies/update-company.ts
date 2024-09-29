"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server-v2";
import { type BrandCompany } from "~/database/model";
import { db } from "~/database/prisma";

import { type MutationActionResponse } from "~/actions";
import { CompanySchema } from "~/actions/schemas";
import {
  ApiClientFieldErrors,
  ApiClientGlobalError,
  ApiClientFormError,
  convertToPlainObject,
} from "~/api";

const UpdateCompanySchema = CompanySchema.partial();

export const updateCompany = async (
  companyId: string,
  data: z.infer<typeof UpdateCompanySchema>,
): Promise<MutationActionResponse<BrandCompany>> => {
  const { user, error, isAdmin } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }

  const company = await db.company.findUnique({
    where: { id: companyId },
  });
  if (!company) {
    return { error: ApiClientGlobalError.NotFound({}).json };
  }
  const parsed = UpdateCompanySchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: ApiClientFormError.fromZodError({ error: parsed.error }).json,
    };
  }

  const fieldErrors = new ApiClientFieldErrors();
  const { name, shortName, ...rest } = parsed.data;

  if (name && (await db.company.count({ where: { name, id: { notIn: [company.id] } } }))) {
    fieldErrors.addUnique(name, "The 'name' must be unique for a given company.");
  } else if (
    shortName &&
    (await db.company.count({ where: { shortName, id: { notIn: [company.id] } } }))
  ) {
    fieldErrors.addUnique(shortName, "The 'shortName' must be unique for a given company.");
  }
  if (fieldErrors.hasErrors) {
    return { error: fieldErrors.json };
  }
  const updated = await db.company.update({
    where: { id: company.id },
    data: {
      ...rest,
      name,
      shortName,
      createdById: user.id,
      updatedById: user.id,
    },
  });
  return { data: convertToPlainObject(updated) };
};
