"use server";
import { getAuthAdminUser } from "~/application/auth";
import { ApiClientError } from "~/application/errors";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { type ExperienceOnSkills, type Experience } from "~/prisma/model";

export const deleteExperience = async (id: string): Promise<void> => {
  const user = await getAuthAdminUser();

  await prisma.$transaction(async tx => {
    let experience: Experience & { readonly skills: ExperienceOnSkills[] };
    try {
      experience = await tx.experience.findUniqueOrThrow({
        where: { id },
        include: { skills: true },
      });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        throw ApiClientError.NotFound();
      }
      throw e;
    }

    await Promise.all(
      experience.skills.map(sk =>
        tx.skill.update({
          where: { id: sk.skillId },
          data: { experiences: { deleteMany: { experienceId: id } }, updatedById: user.id },
        }),
      ),
    );

    await tx.experience.delete({ where: { id } });
  });
};
