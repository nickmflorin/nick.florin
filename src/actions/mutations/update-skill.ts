"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { objIsEmpty } from "~/lib";
import { slugify } from "~/lib/formatters";
import { prisma } from "~/prisma/client";
import { type Skill, type Experience, type Education } from "~/prisma/model";
import { ApiClientFormError, type ApiClientFieldErrors } from "~/http";

import { SkillSchema } from "../schemas";

const UpdateSkillSchema = SkillSchema.partial();

export const updateSkill = async (
  id: string,
  req: z.infer<typeof UpdateSkillSchema>,
): Promise<Skill> => {
  const user = await getAuthAdminUser();

  const parsed = UpdateSkillSchema.parse(req);

  const { slug, experiences: _experiences, educations: _educations, ...data } = parsed;

  const sk = await prisma.$transaction(async tx => {
    // TODO: Should we use an ApiClientError here to indicate that the skill does not exist?
    let skill = await tx.skill.findUniqueOrThrow({ where: { id } });
    const currentLabel = data.label !== undefined ? data.label : skill.label;
    const updateData = {
      ...data,
      slug: slug !== undefined && slug !== null ? slug : slugify(currentLabel),
    };
    if (!objIsEmpty(updateData)) {
      skill = await tx.skill.update({
        where: { id },
        data: {
          ...updateData,
          updatedById: user.id,
        },
      });
    }

    let fieldErrors: ApiClientFieldErrors = {};
    let experiences: Experience[] = [];
    let educations: Education[] = [];

    if (_experiences !== undefined) {
      experiences = await tx.experience.findMany({ where: { id: { in: _experiences } } });
      if (experiences.length !== _experiences.length) {
        fieldErrors = {
          ...fieldErrors,
          experiences: {
            internalMessage: "One or more of the provided experiences do not exist.",
            code: "invalid",
          },
        };
      }
    }
    if (_educations !== undefined) {
      educations = await tx.education.findMany({ where: { id: { in: _educations } } });
      if (educations.length !== _educations.length) {
        fieldErrors = {
          ...fieldErrors,
          experiences: {
            internalMessage: "One or more of the provided educations do not exist.",
            code: "invalid",
          },
        };
      }
    }
    if (Object.keys(fieldErrors).length !== 0) {
      throw ApiClientFormError.BadRequest(fieldErrors);
    }

    if (experiences.length) {
      const currentRelationships = await tx.experienceOnSkills.findMany({
        where: { skillId: skill.id },
      });
      const ids = experiences.map(e => e.id);

      /* We need to remove the relationship between the skill and the experience if there is an
         existing relationship associated with the experience but the experience's ID is not
         included in the API request. */
      const toRemove = currentRelationships.filter(r => !ids.includes(r.experienceId));
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
      const toAdd = experiences.filter(
        e => !currentRelationships.some(r => r.experienceId === e.id),
      );
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
    if (educations.length) {
      const currentRelationships = await tx.educationOnSkills.findMany({
        where: { skillId: skill.id },
      });
      const ids = educations.map(e => e.id);

      /* We need to remove the relationship between the skill and the education if there is an
         existing relationship associated with the education but the education's ID is not
         included in the API request. */
      const toRemove = currentRelationships.filter(r => !ids.includes(r.educationId));
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
      /* We need to add relationships between an education and the skill if the education's ID is
         included in the API request and there is not an existing relationship between that
         education and the skill. */
      const toAdd = educations.filter(e => !currentRelationships.some(r => r.educationId === e.id));
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
    return skill;
  });
  revalidatePath("/admin/skills", "page");
  revalidatePath("/api/skills");
  return sk;
};
