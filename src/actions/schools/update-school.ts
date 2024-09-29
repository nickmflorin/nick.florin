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

const UpdateSchoolSchema = SchoolSchema.partial();

export const updateSchool = async (
  schoolId: string,
  data: z.infer<typeof UpdateSchoolSchema>,
): Promise<MutationActionResponse<BrandSchool>> => {
  const { user, error, isAdmin } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }

  const school = await db.school.findUnique({
    where: { id: schoolId },
  });
  if (!school) {
    return { error: ApiClientGlobalError.NotFound({}).json };
  }
  const parsed = UpdateSchoolSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: ApiClientFormError.fromZodError({ error: parsed.error }).json,
    };
  }

  const fieldErrors = new ApiClientFieldErrors();
  const { name, shortName, ...rest } = parsed.data;

  if (name && (await db.school.count({ where: { name, id: { notIn: [school.id] } } }))) {
    fieldErrors.addUnique(name, "The 'name' must be unique for a given school.");
  } else if (
    shortName &&
    (await db.school.count({ where: { shortName, id: { notIn: [school.id] } } }))
  ) {
    fieldErrors.addUnique(shortName, "The 'shortName' must be unique for a given school.");
  }
  if (fieldErrors.hasErrors) {
    return { error: fieldErrors.json };
  }
  const updated = await db.school.update({
    where: { id: school.id },
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
