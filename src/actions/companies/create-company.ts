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

export const createCompany = async (
  data: z.infer<typeof CompanySchema>,
): Promise<MutationActionResponse<BrandCompany>> => {
  const { user, error, isAdmin } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }
  const parsed = CompanySchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: ApiClientFormError.fromZodError({ error: parsed.error }).json,
    };
  }
  const { name, shortName, ...rest } = parsed.data;
  const fieldErrors = new ApiClientFieldErrors();

  if (await db.company.count({ where: { name } })) {
    fieldErrors.addUnique("name", "The 'name' must be unique for a given company.");
  }
  if (await db.company.count({ where: { shortName } })) {
    fieldErrors.addUnique("shortName", "The 'shortName' must be unique for a given company.");
  }
  if (!fieldErrors.isEmpty) {
    return { error: fieldErrors.json };
  }
  const company = await db.company.create({
    data: {
      ...rest,
      name,
      shortName,
      createdById: user.id,
      updatedById: user.id,
    },
  });
  return { data: convertToPlainObject(company) };
};
