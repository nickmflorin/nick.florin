"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { slugify } from "~/lib/formatters";
import { prisma } from "~/prisma/client";
import { ApiClientFieldErrors } from "~/api";
import { SkillSchema } from "~/api/schemas";
import { convertToPlainObject } from "~/api/serialization";

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
    repositories: _repositories,
    ...data
  } = parsed.data;

  const slug = _slug ?? slugify(data.label);

  const fieldErrors = new ApiClientFieldErrors();

  return await prisma.$transaction(async tx => {
    if (await tx.skill.count({ where: { label: data.label } })) {
      fieldErrors.addUnique("label", "The label must be unique.");
      /* If the slug is not explicitly provided and the label does not violate the unique
         constraint, but the slugified form of the label does, this should be a more specific error
         message. */
    } else if (!_slug && (await tx.skill.count({ where: { slug } }))) {
      fieldErrors.addUnique(
        "label",
        "The auto-generated slug for the label is not unique. Please provide a unique slug.",
      );
    }
    if (_slug && (await tx.skill.count({ where: { slug: _slug } }))) {
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
    const [repositories] = await queryM2MsDynamically(tx, {
      model: "repository",
      ids: _repositories,
      fieldErrors,
    });
    if (!fieldErrors.isEmpty) {
      return fieldErrors.json;
    }

    const skill = await tx.skill.create({
      data: {
        ...data,
        slug,
        createdById: user.id,
        updatedById: user.id,
        experiences: experiences ? { connect: experiences.map(e => ({ id: e.id })) } : undefined,
        projects: projects ? { connect: projects.map(e => ({ id: e.id })) } : undefined,
        educations: educations ? { connect: educations.map(e => ({ id: e.id })) } : undefined,
        repositories: repositories ? { connect: repositories.map(e => ({ id: e.id })) } : undefined,
      },
    });
    // TODO: We may have to revalidate other API paths as well.
    revalidatePath("/admin/skills", "page");
    revalidatePath("/api/skills");

    if (experiences) {
      revalidatePath("/api/experiences");
      experiences.forEach(exp => {
        revalidatePath("/resume/experiences", "page");
        revalidatePath("/admin/experiences", "page");
        revalidatePath("/api/experiences");
        revalidatePath(`/api/experiences/${exp.id}`);
      });
    }

    if (educations) {
      revalidatePath("/api/educations");
      educations.forEach(edu => {
        revalidatePath("/resume/educations", "page");
        revalidatePath("/admin/educations", "page");
        revalidatePath("/api/educations");
        revalidatePath(`/api/educations/${edu.id}`);
      });
    }

    if (projects) {
      revalidatePath("/api/projects");
      projects.forEach(proj => {
        revalidatePath(`/projects/${proj.id}`, "page");
        revalidatePath(`/api/projects/${proj.id}`);
      });
    }

    if (repositories) {
      revalidatePath("/api/repositories");
      repositories.forEach(repo => revalidatePath(`/api/repositories/${repo.id}`));
    }

    return convertToPlainObject(skill);
  });
};
