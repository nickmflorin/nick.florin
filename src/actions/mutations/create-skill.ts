"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { slugify } from "~/lib/formatters";
import { prisma } from "~/prisma/client";
import { ApiClientFormError, ApiClientFieldErrorCodes, ApiClientFieldErrors } from "~/api";
import { SkillSchema } from "~/api/schemas";

import { queryM2MsDynamically } from "./m2ms";

export const createSkill = async (req: z.infer<typeof SkillSchema>) => {
  const user = await getAuthAdminUser();

  const parsed = SkillSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFormError.BadRequest(parsed.error, SkillSchema).toJson();
  }
  const {
    slug: _slug,
    experiences: _experiences,
    educations: _educations,
    projects: _projects,
    ...data
  } = parsed.data;

  const slug = _slug ?? slugify(data.label);

  const fieldErrors = new ApiClientFieldErrors();

  const sk = await prisma.$transaction(async tx => {
    if (await prisma.skill.count({ where: { label: data.label } })) {
      fieldErrors.add("label", {
        code: ApiClientFieldErrorCodes.unique,
        message: "The label must be unique!",
      });
      /* If the slug is not explicitly provided and the label does not violate the unique
         constraint, but the slugified form of the label does, this should be a more specific error
         message. */
    } else if (!_slug && (await prisma.skill.count({ where: { slug } }))) {
      fieldErrors.add("label", {
        code: ApiClientFieldErrorCodes.unique,
        message:
          "The auto-generated slug for the label is not unique. Please provide a unique slug.",
      });
    }
    if (_slug && (await prisma.skill.count({ where: { slug: _slug } }))) {
      fieldErrors.add("slug", {
        code: ApiClientFieldErrorCodes.unique,
        message: "The slug must be unique!",
      });
    }
    const [experiences] = await queryM2MsDynamically(tx, {
      model: "experience",
      ids: _experiences,
      fieldErrors,
    });
    const [educations] = await queryM2MsDynamically(tx, {
      model: "education",
      ids: _educations,
      fieldErrors,
    });
    const [projects] = await queryM2MsDynamically(tx, {
      model: "project",
      ids: _projects,
      fieldErrors,
    });
    if (!fieldErrors.isEmpty) {
      return fieldErrors.toError().toJson();
    }

    return await prisma.skill.create({
      data: {
        ...data,
        slug,
        createdById: user.id,
        updatedById: user.id,
        experiences: {
          createMany: {
            data: (experiences ?? []).map(exp => ({
              assignedById: user.id,
              experienceId: exp.id,
            })),
          },
        },
        projects: {
          createMany: {
            data: (projects ?? []).map(p => ({
              assignedById: user.id,
              projectId: p.id,
            })),
          },
        },
        educations: {
          createMany: {
            data: (educations ?? []).map(edu => ({
              assignedById: user.id,
              educationId: edu.id,
            })),
          },
        },
      },
    });
  });
  // TODO: We may have to revalidate other API paths as well.
  revalidatePath("/admin/skills", "page");
  revalidatePath("/admin/experiences", "page");
  revalidatePath("/admin/educations", "page");
  return sk;
};
