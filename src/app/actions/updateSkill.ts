"use server";
import { z } from "zod";

import { ClientError } from "~/application/errors";
import { objIsEmpty } from "~/lib";
import { slugify } from "~/lib/formatters";
import { getAuthUser } from "~/server/auth";
import { prisma } from "~/prisma/client";
import { type Skill } from "~/prisma/model";

const UpdateSkillSchema = z.object({
  label: z.string().optional(),
  slug: z.string().optional(),
  refreshSlug: z.boolean().optional(),
  experiences: z.array(z.string()).optional(),
  educations: z.array(z.string()).optional(),
});

export const updateSkill = async (
  id: string,
  {
    refreshSlug,
    slug,
    experiences: _experiences,
    educations: _educations,
    ...data
  }: z.infer<typeof UpdateSkillSchema>,
): Promise<Skill> => {
  const user = await getAuthUser();
  /* Note: We may want to return the error in the response body in the future, for now this is
     fine - since it is not expected. */
  if (!user) {
    throw ClientError.NotAuthenticated();
  } else if (!user.isAdmin) {
    throw ClientError.Forbidden();
  }

  return await prisma.$transaction(async tx => {
    let skill = await tx.skill.findUniqueOrThrow({ where: { id } });
    const currentLabel = data.label !== undefined ? data.label : skill.label;

    const updateData = {
      ...data,
      slug: slug !== undefined ? slug : refreshSlug ? slugify(currentLabel) : undefined,
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
    if (_experiences !== undefined) {
      const experiences = await tx.experience.findMany({ where: { id: { in: _experiences } } });
      if (experiences.length !== _experiences.length) {
        throw ClientError.BadRequest("One or more of the provided experiences do not exist.");
      }
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
    if (_educations !== undefined) {
      const educations = await tx.education.findMany({ where: { id: { in: _educations } } });
      if (educations.length !== _educations.length) {
        throw ClientError.BadRequest("One or more of the provided educations do not exist.");
      }
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
};
