"use server";
import { getAuthAdminUser } from "~/application/auth";
import { logger } from "~/application/logger";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { type EducationOnSkills, type Education, DetailEntityType } from "~/prisma/model";
import { ApiClientGlobalError } from "~/api";

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
        throw ApiClientGlobalError.NotFound();
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

    const details = await tx.detail.findMany({
      where: { entityType: DetailEntityType.EDUCATION, entityId: education.id },
    });
    if (details.length !== 0) {
      logger.info(
        `The education being deleted is associated with ${details.length} details, which ` +
          "will also be deleted.",
        { educationId: education.id, details: details.map(d => d.id) },
      );
      const result = await tx.detail.deleteMany({
        where: { entityType: DetailEntityType.EDUCATION, entityId: education.id },
      });
      logger.info(`Deleted ${result.count} details associated with the education being deleted.`, {
        educationId: education.id,
      });
      logger.info("Deleting nested details that are associated with the education being deleted.", {
        educationId: education.id,
      });
      const nestedResult = await tx.nestedDetail.deleteMany({
        where: { detailId: { in: details.map(d => d.id) } },
      });
      if (nestedResult.count !== 0) {
        logger.info(
          `Deleted ${nestedResult.count} nested details associated with the education ` +
            "being deleted.",
          { educationId: education.id },
        );
      }
    }

    await tx.experience.delete({ where: { id } });
  });
};
