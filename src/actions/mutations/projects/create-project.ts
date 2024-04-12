"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { logger } from "~/application/logger";
import { slugify } from "~/lib/formatters";
import { prisma } from "~/prisma/client";
import { ApiClientFieldErrors } from "~/api";
import { ProjectSchema } from "~/api/schemas";
import { convertToPlainObject } from "~/api/serialization";

import { queryM2MsDynamically } from "../m2ms";

export const createProject = async (req: z.infer<typeof ProjectSchema>) => {
  const user = await getAuthAdminUser();

  const parsed = ProjectSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFieldErrors.fromZodError(parsed.error, ProjectSchema).json;
  }
  const { slug: _slug, details: _details, skills: _skills, ...data } = parsed.data;

  const slug = _slug ?? slugify(data.name);

  const fieldErrors = new ApiClientFieldErrors();

  return await prisma.$transaction(async tx => {
    if (await tx.project.count({ where: { name: data.name } })) {
      fieldErrors.addUnique("name", "The name must be unique.");
      /* If the slug is not explicitly provided and the name does not violate the unique
         constraint, but the slugified form of the name does, this should be a more specific error
         message. */
    } else if (!_slug && (await tx.project.count({ where: { slug } }))) {
      fieldErrors.addUnique(
        "name",
        "The auto-generated slug for the name is not unique. Please provide a unique slug.",
      );
    }
    if (_slug && (await tx.project.count({ where: { slug: _slug } }))) {
      fieldErrors.addUnique("slug", "The slug must be unique.");
    }
    const [details] = await queryM2MsDynamically(tx, {
      model: "detail",
      // It is important to cast to undefined if the details are not provided in the payload!
      ids: _details ? _details.filter(d => d.type === "detail").map(d => d.id) : undefined,
      fieldErrors,
    });
    const [nestedDetails] = await queryM2MsDynamically(tx, {
      model: "nestedDetail",
      // It is important to cast to undefined if the details are not provided in the payload!
      ids: _details ? _details.filter(d => d.type === "nestedDetail").map(d => d.id) : undefined,
      fieldErrors,
    });
    const [skills] = await queryM2MsDynamically(tx, {
      model: "skill",
      ids: _skills,
      fieldErrors,
    });
    if (!fieldErrors.isEmpty) {
      return fieldErrors.json;
    }

    const project = await tx.project.create({
      data: {
        ...data,
        slug,
        createdById: user.id,
        updatedById: user.id,
        skills: skills ? { connect: skills.map(skill => ({ slug: skill.slug })) } : undefined,
      },
    });
    if (details && details.length !== 0) {
      logger.info(`Associating ${details.length} details with new project, '${project.name}'.`, {
        projectId: project.id,
      });
      const result = await tx.detail.updateMany({
        where: { id: { in: details.map(d => d.id) } },
        data: { projectId: project.id, updatedById: user.id },
      });
      logger.info(
        `Successfully associated ${result.count} details with new project, '${project.name}'.`,
        { projectId: project.id },
      );
    }

    if (nestedDetails && nestedDetails.length !== 0) {
      logger.info(
        `Associating ${nestedDetails.length} nested details with new project, '${project.name}'.`,
        {
          projectId: project.id,
        },
      );
      const result = await tx.nestedDetail.updateMany({
        where: { id: { in: nestedDetails.map(d => d.id) } },
        data: { projectId: project.id, updatedById: user.id },
      });
      logger.info(
        `Successfully associated ${result.count} nested details with new project, '${project.name}'.`,
        { projectId: project.id },
      );
    }

    revalidatePath("/admin/projects", "page");
    revalidatePath("/api/projects");
    revalidatePath(`/projects/${project.slug}`, "page");
    return convertToPlainObject(project);
  });
};
