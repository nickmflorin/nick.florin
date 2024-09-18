"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server";
import { type BrandSkill } from "~/database/model";
import { calculateSkillsExperience } from "~/database/model";
import { db } from "~/database/prisma";
import { slugify } from "~/lib/formatters";

import { SkillSchema } from "~/actions-v2/schemas";
import { ApiClientFieldErrors, ApiClientGlobalError, type ApiClientErrorJson } from "~/api";
import { convertToPlainObject } from "~/api/serialization";

import { queryM2MsDynamically } from "../m2ms";

const UpdateSkillSchema = SkillSchema.partial();

export const updateSkill = async (id: string, req: z.infer<typeof UpdateSkillSchema>) => {
  const { user } = await getAuthedUser({ strict: true });

  return await db.$transaction(async (tx): Promise<BrandSkill | ApiClientErrorJson> => {
    const skill = await tx.skill.findUnique({ where: { id } });
    if (!skill) {
      throw ApiClientGlobalError.NotFound();
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
      courses: _courses,
      ...data
    } = parsed.data;

    const fieldErrors = new ApiClientFieldErrors();

    const label = _label !== undefined ? _label : skill.label;

    if (_label !== undefined && _label.trim() !== skill.label.trim()) {
      if (await db.skill.count({ where: { label: _label, id: { notIn: [skill.id] } } })) {
        fieldErrors.addUnique("label", "The label must be unique.");
        /* If the slug is being cleared, we have to make sure that the slugified version of the new
           label is still unique. */
      } else if (
        _slug === null &&
        (await db.skill.count({
          where: { slug: slugify(_label), id: { notIn: [skill.id] } },
        }))
      ) {
        // Here, the slug should be provided explicitly, rather than cleared.
        fieldErrors.addUnique("label", "The label does not generate a unique slug.");
      }
    } else if (
      _slug === null &&
      (await db.skill.count({
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
      (await db.skill.count({ where: { slug: _slug, id: { notIn: [skill.id] } } }))
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
    const [courses] = await queryM2MsDynamically(tx, {
      model: "course",
      ids: _courses,
      fieldErrors,
    });

    if (!fieldErrors.isEmpty) {
      return fieldErrors.json;
    }
    const updated = await tx.skill.update({
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
        courses: courses ? { connect: courses.map(e => ({ id: e.id })) } : undefined,
      },
    });
    const calculatedExperience = await calculateSkillsExperience(tx, updated.id, {
      user,
      returnAs: "experience",
    });
    return convertToPlainObject({
      ...updated,
      calculatedExperience,
    });
  });
};
