"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import {
  ApiClientError,
  type ApiClientFieldErrors,
  ApiClientFieldErrorCodes,
} from "~/application/errors";
import { slugify } from "~/lib/formatters";
import { prisma } from "~/prisma/client";

import { SkillSchema } from "./schemas";

export const createSkill = async (req: z.infer<typeof SkillSchema>) => {
  const user = await getAuthAdminUser();

  const parsed = SkillSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientError.BadRequest(parsed.error, SkillSchema);
  }
  const { slug: _slug, experiences, educations, ...data } = parsed.data;

  const slug = _slug ?? slugify(data.label);

  let fieldErrs: ApiClientFieldErrors = {};
  if (await prisma.skill.count({ where: { label: data.label } })) {
    fieldErrs = {
      ...fieldErrs,
      label: [
        {
          code: ApiClientFieldErrorCodes.unique,
          message: "The label must be unique!",
        },
      ],
    };
    /* If the slug is not explicitly provided and the label does not violate the unique constraint,
       but the slugified form of the label does, this should be a more specific error message. */
  } else if (!_slug && (await prisma.skill.count({ where: { slug } }))) {
    fieldErrs = {
      ...fieldErrs,
      label: [
        {
          code: ApiClientFieldErrorCodes.unique,
          message:
            "The auto-generated slug for the label is not unique. Please provide a unique slug.",
        },
      ],
    };
  }
  if (_slug && (await prisma.skill.count({ where: { slug: _slug } }))) {
    fieldErrs = {
      ...fieldErrs,
      slug: [
        {
          code: ApiClientFieldErrorCodes.unique,
          message: "The slug must be unique!",
        },
      ],
    };
  }
  if (Object.keys(fieldErrs).length !== 0) {
    return ApiClientError.BadRequest(fieldErrs).toJson();
  }

  const skill = await prisma.skill.create({
    data: {
      ...data,
      slug,
      createdById: user.id,
      updatedById: user.id,
      experiences: {
        createMany: {
          data: (experiences ?? []).map(id => ({
            assignedById: user.id,
            experienceId: id,
          })),
        },
      },
      educations: {
        createMany: {
          data: (educations ?? []).map(id => ({
            assignedById: user.id,
            educationId: id,
          })),
        },
      },
    },
  });
  revalidatePath("/admin/skills", "page");
  return skill;
};
