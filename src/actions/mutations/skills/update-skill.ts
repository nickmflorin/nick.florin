"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { slugify } from "~/lib/formatters";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { type BrandSkill } from "~/prisma/model";
import { ApiClientFieldErrors, ApiClientGlobalError, type ApiClientErrorJson } from "~/api";
import { SkillSchema } from "~/api/schemas";
import { convertToPlainObject } from "~/api/serialization";

import { queryM2MsDynamically } from "../m2ms";

const UpdateSkillSchema = SkillSchema.partial();

export const updateSkill = async (id: string, req: z.infer<typeof UpdateSkillSchema>) => {
  const user = await getAuthAdminUser({ strict: true });

  return await prisma.$transaction(async (tx): Promise<BrandSkill | ApiClientErrorJson> => {
    let skill: BrandSkill;
    try {
      skill = await tx.skill.findUniqueOrThrow({
        where: { id },
      });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        throw ApiClientGlobalError.NotFound();
      }
      throw e;
    }
    const parsed = UpdateSkillSchema.safeParse(req);
    if (!parsed.success) {
      return ApiClientFieldErrors.fromZodError(parsed.error, UpdateSkillSchema).json;
    }
    const {
      slug: _slug,
      projects: _projects,
      experiences: _experiences,
      educations: _educations,
      repositories: _repositories,
      label: _label,
      ...data
    } = parsed.data;

    const fieldErrors = new ApiClientFieldErrors();

    const label = _label !== undefined ? _label : skill.label;

    if (_label !== undefined && _label.trim() !== skill.label.trim()) {
      if (await prisma.skill.count({ where: { label: _label, id: { notIn: [skill.id] } } })) {
        fieldErrors.addUnique("label", "The label must be unique.");
        /* If the slug is being cleared, we have to make sure that the slugified version of the new
           label is still unique. */
      } else if (
        _slug === null &&
        (await prisma.skill.count({
          where: { slug: slugify(_label), id: { notIn: [skill.id] } },
        }))
      ) {
        // Here, the slug should be provided explicitly, rather than cleared.
        fieldErrors.addUnique("label", "The label does not generate a unique slug.");
      }
    } else if (
      _slug === null &&
      (await prisma.skill.count({
        where: { slug: slugify(label), id: { notIn: [skill.id] } },
      }))
    ) {
      /* Here, the slug should be provided explicitly, rather than cleared.  The error is shown in
         regard to the slug, not the label, because the slug is what is being cleared whereas the
         label remains unchanged. */
      fieldErrors.addUnique(
        "slug",
        "The label generates a non-unique slug, so the slug must be provided.",
      );
    } else if (
      _slug !== null &&
      _slug !== undefined &&
      (await prisma.skill.count({ where: { slug: _slug, id: { notIn: [skill.id] } } }))
    ) {
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
    skill = await tx.skill.update({
      where: { id },
      data: {
        ...data,
        slug: _slug === undefined ? undefined : _slug === null ? slugify(label) : _slug.trim(),
        label:
          _label === undefined || _label.trim() === skill.label.trim() ? undefined : _label.trim(),
        updatedById: user.id,
        projects: projects ? { set: projects.map(p => ({ id: p.id })) } : undefined,
        experiences: experiences ? { set: experiences.map(p => ({ id: p.id })) } : undefined,
        educations: educations ? { set: educations.map(p => ({ id: p.id })) } : undefined,
        repositories: repositories ? { set: repositories.map(p => ({ id: p.id })) } : undefined,
      },
    });

    revalidatePath("/admin/skills", "page");
    revalidatePath("/api/skills");
    revalidatePath(`/api/skills/${skill.id}`);

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
