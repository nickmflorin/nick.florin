"use server";
import { getAuthAdminUser } from "~/application/auth";
import { prisma } from "~/prisma/client";

export const deleteSkill = async (id: string): Promise<void> => {
  /* Note: We may want to return the error in the response body in the future, for now this is
     fine - since it is not expected. */
  const user = await getAuthAdminUser();

  await prisma.$transaction(async tx => {
    const skill = await tx.skill.findUniqueOrThrow({
      where: { id },
      include: { experiences: true, educations: true },
    });

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
