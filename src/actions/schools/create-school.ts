"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server-v2";
import { type BrandSchool } from "~/database/model";
import { db } from "~/database/prisma";

import { type MutationActionResponse } from "~/actions";
import { SchoolSchema } from "~/actions/schemas";
import {
  ApiClientFieldErrors,
  ApiClientGlobalError,
  ApiClientFormError,
  convertToPlainObject,
} from "~/api";

export const createSchool = async (
  data: z.infer<typeof SchoolSchema>,
): Promise<MutationActionResponse<BrandSchool>> => {
  const { user, error, isAdmin } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }
  const parsed = SchoolSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: ApiClientFormError.fromZodError({ error: parsed.error }).json,
    };
  }
  const { name, shortName, ...rest } = parsed.data;
  const fieldErrors = new ApiClientFieldErrors();

  if (await db.school.count({ where: { name } })) {
    fieldErrors.addUnique("name", "The 'name' must be unique for a given school.");
  }
  if (await db.school.count({ where: { shortName } })) {
    fieldErrors.addUnique("shortName", "The 'shortName' must be unique for a given school.");
  }
  if (!fieldErrors.isEmpty) {
    return { error: fieldErrors.json };
  }
  const school = await db.school.create({
    data: {
      ...rest,
      name,
      shortName,
      createdById: user.id,
      updatedById: user.id,
    },
  });
  return { data: convertToPlainObject(school) };
};
