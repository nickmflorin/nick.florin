"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server-v2";
import { type BrandSkill } from "~/database/model";
import { calculateSkillsExperience } from "~/database/model";
import { db } from "~/database/prisma";
import { slugify } from "~/lib/formatters";

import { type MutationActionResponse } from "~/actions-v2";
import { queryM2MsDynamically } from "~/actions-v2/m2ms";
import { SkillSchema } from "~/actions-v2/schemas";
import {
  ApiClientFieldErrors,
  ApiClientGlobalError,
  ApiClientFormError,
  convertToPlainObject,
} from "~/api-v2";

const UpdateSkillSchema = SkillSchema.partial();

export const createSkill = async (
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

  const parsed = SkillSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: ApiClientFormError.fromZodError({ error: parsed.error }).json,
    };
  }
  const {
    slug: _slug,
    experiences: _experiences,
    educations: _educations,
    projects: _projects,
    repositories: _repositories,
    courses: _courses,
    ...rest
  } = parsed.data;

  const slug = _slug ?? slugify(rest.label);

  const fieldErrors = new ApiClientFieldErrors();

  if (await db.skill.count({ where: { label: rest.label } })) {
    fieldErrors.addUnique("label", "The label must be unique.");
    /* If the slug is not explicitly provided and the label does not violate the unique
       constraint, but the slugified form of the label does, this should be a more specific error
       message. */
  } else if (!_slug && (await db.skill.count({ where: { slug } }))) {
    fieldErrors.addUnique(
      "label",
      "The auto-generated slug for the label is not unique. Please either provide a unique " +
        "slug or change the label such that it's slug is unique.",
    );
  }
  if (_slug && (await db.skill.count({ where: { slug: _slug } }))) {
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

  return await db.$transaction(async tx => {
    const skill = await tx.skill.create({
      data: {
        ...rest,
        slug,
        createdById: user.id,
        updatedById: user.id,
        experiences: experiences ? { connect: experiences.map(e => ({ id: e.id })) } : undefined,
        projects: projects ? { connect: projects.map(e => ({ id: e.id })) } : undefined,
        educations: educations ? { connect: educations.map(e => ({ id: e.id })) } : undefined,
        repositories: repositories ? { connect: repositories.map(e => ({ id: e.id })) } : undefined,
        courses: courses ? { connect: courses.map(e => ({ id: e.id })) } : undefined,
        calculatedExperience: 0,
      },
    });
    const calculatedExperience = await calculateSkillsExperience(tx, skill.id, {
      user,
      returnAs: "experience",
    });
    return { data: convertToPlainObject({ ...skill, calculatedExperience }) };
  });
};
