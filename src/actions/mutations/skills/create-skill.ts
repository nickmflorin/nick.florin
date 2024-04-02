"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { slugify } from "~/lib/formatters";
import { prisma } from "~/prisma/client";
import { ApiClientFieldErrors } from "~/api";
import { SkillSchema } from "~/api/schemas";

import { queryM2MsDynamically } from "../m2ms";

export const createSkill = async (req: z.infer<typeof SkillSchema>) => {
  const user = await getAuthAdminUser();

  const parsed = SkillSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFieldErrors.fromZodError(parsed.error, SkillSchema).json;
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
      fieldErrors.addUnique("label", "The label must be unique.");
      /* If the slug is not explicitly provided and the label does not violate the unique
         constraint, but the slugified form of the label does, this should be a more specific error
         message. */
    } else if (!_slug && (await prisma.skill.count({ where: { slug } }))) {
      fieldErrors.addUnique(
        "label",
        "The auto-generated slug for the label is not unique. Please provide a unique slug.",
      );
    }
    if (_slug && (await prisma.skill.count({ where: { slug: _slug } }))) {
      fieldErrors.addUnique("slug", "The slug must be unique.");
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
      return fieldErrors.json;
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
