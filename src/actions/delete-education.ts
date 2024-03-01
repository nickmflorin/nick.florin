"use server";
import { getAuthAdminUser } from "~/application/auth";
import { ApiClientError } from "~/application/errors";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { type EducationOnSkills, type Education } from "~/prisma/model";

export const deleteEducation = async (id: string): Promise<void> => {
  const user = await getAuthAdminUser();

  await prisma.$transaction(async tx => {
    let education: Education & { readonly skills: EducationOnSkills[] };
    try {
      education = await tx.education.findUniqueOrThrow({
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
      education.skills.map(sk =>
        tx.skill.update({
          where: { id: sk.skillId },
          data: { educations: { deleteMany: { educationId: id } }, updatedById: user.id },
        }),
      ),
    );

    await tx.experience.delete({ where: { id } });
  });
};
