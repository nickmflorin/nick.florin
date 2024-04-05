"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { objIsEmpty } from "~/lib";
import { slugify } from "~/lib/formatters";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import {
  type Skill,
  type Experience,
  type Education,
  type Project,
  type Transaction,
  type User,
} from "~/prisma/model";
import { ApiClientFieldErrors, ApiClientGlobalError } from "~/api";
import { SkillSchema } from "~/api/schemas";

import { queryM2MsDynamically } from "../m2ms";

const UpdateSkillSchema = SkillSchema.partial();

const syncExperiences = async (
  tx: Transaction,
  { skill, experiences, user }: { skill: Skill; user: User; experiences?: Experience[] },
) => {
  if (experiences) {
    const relationships = await tx.experienceOnSkills.findMany({
      where: { skillId: skill.id },
    });
    /* We need to remove the relationship between the skill and the experience if there is an
       existing relationship associated with the experience but the experience's ID is not included
       in the API request. */
    const toRemove = relationships.filter(
      r => !experiences.map(e => e.id).includes(r.experienceId),
    );
    if (toRemove.length !== 0) {
      await Promise.all(
        toRemove.map(relationship =>
          tx.experienceOnSkills.delete({
            where: {
              skillId_experienceId: {
                skillId: relationship.skillId,
                experienceId: relationship.experienceId,
              },
            },
          }),
        ),
      );
    }
    /* We need to add relationships between an experience and the skill if the experience's ID is
       included in the API request and there is not an existing relationship between that
       experience and the skill. */
    const toAdd = experiences.filter(e => !relationships.some(r => r.experienceId === e.id));
    if (toAdd.length !== 0) {
      await tx.experienceOnSkills.createMany({
        data: toAdd.map(e => ({
          skillId: skill.id,
          experienceId: e.id,
          assignedById: user.id,
        })),
      });
    }
  }
};

const syncEducations = async (
  tx: Transaction,
  { skill, educations, user }: { skill: Skill; user: User; educations?: Education[] },
) => {
  if (educations) {
    const relationships = await tx.educationOnSkills.findMany({
      where: { skillId: skill.id },
    });
    /* We need to remove the relationship between the skill and the experience if there is an
       existing relationship associated with the experience but the experience's ID is not included
       in the API request. */
    const toRemove = relationships.filter(r => !educations.map(e => e.id).includes(r.educationId));
    if (toRemove.length !== 0) {
      await Promise.all(
        toRemove.map(relationship =>
          tx.educationOnSkills.delete({
            where: {
              skillId_educationId: {
                skillId: relationship.skillId,
                educationId: relationship.educationId,
              },
            },
          }),
        ),
      );
    }
    /* We need to add relationships between an experience and the skill if the experience's ID is
       included in the API request and there is not an existing relationship between that
       experience and the skill. */
    const toAdd = educations.filter(e => !relationships.some(r => r.educationId === e.id));
    if (toAdd.length !== 0) {
      await tx.educationOnSkills.createMany({
        data: toAdd.map(e => ({
          skillId: skill.id,
          educationId: e.id,
          assignedById: user.id,
        })),
      });
    }
  }
};

const syncProjects = async (
  tx: Transaction,
  { skill, projects, user }: { skill: Skill; user: User; projects?: Project[] },
) => {
  if (projects) {
    const relationships = await tx.projectOnSkills.findMany({
      where: { skillId: skill.id },
    });
    /* We need to remove the relationship between the skill and the project if there is an
       existing relationship associated with the project but the project's ID is not included
       in the API request. */
    const toRemove = relationships.filter(r => !projects.map(e => e.id).includes(r.projectId));
    if (toRemove.length !== 0) {
      await Promise.all(
        toRemove.map(relationship =>
          tx.projectOnSkills.delete({
            where: {
              skillId_projectId: {
                skillId: relationship.skillId,
                projectId: relationship.projectId,
              },
            },
          }),
        ),
      );
    }
    /* We need to add relationships between an experience and the skill if the experience's ID is
       included in the API request and there is not an existing relationship between that
       experience and the skill. */
    const toAdd = projects.filter(e => !relationships.some(r => r.projectId === e.id));
    if (toAdd.length !== 0) {
      await tx.projectOnSkills.createMany({
        data: toAdd.map(e => ({
          skillId: skill.id,
          projectId: e.id,
          assignedById: user.id,
        })),
      });
    }
  }
};

export const updateSkill = async (id: string, req: z.infer<typeof UpdateSkillSchema>) => {
  const user = await getAuthAdminUser();

  const sk = await prisma.$transaction(async tx => {
    let skill: Skill;
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

    if (!fieldErrors.isEmpty) {
      return fieldErrors.json;
    }

    const update = {
      ...data,
      slug: _slug === undefined ? undefined : _slug === null ? slugify(label) : _slug.trim(),
      label:
        _label === undefined || _label.trim() === skill.label.trim() ? undefined : _label.trim(),
    };

    if (!objIsEmpty(update)) {
      skill = await tx.skill.update({
        where: { id },
        data: {
          ...update,
          updatedById: user.id,
        },
      });
    }

    await syncExperiences(tx, { experiences, skill, user });
    await syncEducations(tx, { educations, skill, user });
    await syncProjects(tx, { projects, skill, user });

    return skill;
  });

  // TODO: Add /admin/projects once that page is setup.
  revalidatePath("/admin/skills", "page");
  revalidatePath("/admin/experiences", "page");
  revalidatePath("/admin/educations", "page");
  revalidatePath("/api/skills");
  revalidatePath("/api/experiences");
  revalidatePath("/api/educations");
  revalidatePath("/api/projects");
  return sk;
};
