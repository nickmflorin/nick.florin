"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server";
import { slugify } from "~/lib/formatters";
import { prisma } from "~/prisma/client";
import { calculateSkillsExperience } from "~/prisma/model";

import { ApiClientFieldErrors } from "~/api";
import { SkillSchema } from "~/api/schemas";
import { convertToPlainObject } from "~/api/serialization";

import { queryM2MsDynamically } from "../m2ms";

export const createSkill = async (req: z.infer<typeof SkillSchema>) => {
  const { user } = await getAuthedUser();

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
    courses: _courses,
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
        "The auto-generated slug for the label is not unique. Please either provide a unique " +
          "slug or change the label such that it's slug is unique.",
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
    const [courses] = await queryM2MsDynamically(tx, {
      model: "course",
      ids: _courses,
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
        courses: courses ? { connect: courses.map(e => ({ id: e.id })) } : undefined,
        calculatedExperience: 0,
      },
    });
    const calculatedExperience = await calculateSkillsExperience(tx, skill.id, {
      user,
      returnAs: "experience",
    });
    return convertToPlainObject({ ...skill, calculatedExperience });
  });
};
