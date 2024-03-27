"use server";
import { getAuthAdminUser } from "~/application/auth";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { type Skill, type ExperienceOnSkills, type EducationOnSkills } from "~/prisma/model";
import { ApiClientGlobalError } from "~/http";

export const deleteSkill = async (id: string): Promise<void> => {
  const user = await getAuthAdminUser();

  await prisma.$transaction(async tx => {
    let skill: Skill & {
      readonly experiences: ExperienceOnSkills[];
      readonly educations: EducationOnSkills[];
    };
    try {
      skill = await tx.skill.findUniqueOrThrow({
        where: { id },
        include: { experiences: true, educations: true },
      });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        throw ApiClientGlobalError.NotFound();
      }
      throw e;
    }

    await Promise.all(
      skill.experiences.map(exp =>
        tx.experience.update({
          where: { id: exp.experienceId },
          data: { skills: { deleteMany: { skillId: id } }, updatedById: user.id },
        }),
      ),
    );

    await Promise.all(
      skill.educations.map(edu =>
        tx.education.update({
          where: { id: edu.educationId },
          data: { skills: { deleteMany: { skillId: id } }, updatedById: user.id },
        }),
      ),
    );

    await tx.skill.delete({ where: { id } });
  });
};
