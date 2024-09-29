"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server-v2";
import { type BrandSkill } from "~/database/model";
import { calculateSkillsExperience } from "~/database/model";
import { db } from "~/database/prisma";
import { slugify } from "~/lib/formatters";

import { type MutationActionResponse } from "~/actions";
import { queryM2MsDynamically } from "~/actions/m2ms";
import { SkillSchema } from "~/actions/schemas";
import {
  ApiClientFieldErrors,
  ApiClientGlobalError,
  ApiClientFormError,
  convertToPlainObject,
} from "~/api";

const UpdateSkillSchema = SkillSchema.partial();

export const updateSkill = async (
  skillId: string,
  data: z.infer<typeof UpdateSkillSchema>,
): Promise<MutationActionResponse<BrandSkill>> => {
  const { user, error, isAdmin } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }

  const skill = await db.skill.findUnique({
    where: { id: skillId },
  });
  if (!skill) {
    return { error: ApiClientGlobalError.NotFound({}).json };
  }

  const parsed = UpdateSkillSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: ApiClientFormError.fromZodError({ error: parsed.error }).json,
    };
  }

  const {
    slug: _slug,
    projects: _projects,
    experiences: _experiences,
    educations: _educations,
    repositories: _repositories,
    label: _label,
    courses: _courses,
    ...rest
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

  const [experiences] = await queryM2MsDynamically(db, {
    model: "experience",
    ids: _experiences,
    fieldErrors,
  });
  const [educations] = await queryM2MsDynamically(db, {
    model: "education",
    ids: _educations,
    fieldErrors,
  });
  const [projects] = await queryM2MsDynamically(db, {
    model: "project",
    ids: _projects,
    fieldErrors,
  });
  const [repositories] = await queryM2MsDynamically(db, {
    model: "repository",
    ids: _repositories,
    fieldErrors,
  });
  const [courses] = await queryM2MsDynamically(db, {
    model: "course",
    ids: _courses,
    fieldErrors,
  });

  if (!fieldErrors.isEmpty) {
    return { error: fieldErrors.json };
  }
  return await db.$transaction(async (tx): Promise<MutationActionResponse<BrandSkill>> => {
    const updated = await tx.skill.update({
      where: { id: skill.id },
      data: {
        ...rest,
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
    return {
      data: convertToPlainObject({
        ...updated,
        calculatedExperience,
      }),
    };
  });
};
