"use server";
import { getAuthAdminUser } from "~/application/auth";
import { logger } from "~/application/logger";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { type Experience, DetailEntityType } from "~/prisma/model";
import { ApiClientGlobalError } from "~/api";

export const deleteExperience = async (id: string): Promise<void> => {
  await getAuthAdminUser({ strict: true });

  await prisma.$transaction(async tx => {
    let experience: Experience;
    try {
      experience = await tx.experience.findUniqueOrThrow({
        where: { id },
      });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        throw ApiClientGlobalError.NotFound();
      }
      throw e;
    }

    const details = await tx.detail.findMany({
      where: { entityType: DetailEntityType.EXPERIENCE, entityId: experience.id },
    });
    if (details.length !== 0) {
      logger.info(
        `The experience being deleted is associated with ${details.length} details, which ` +
          "will also be deleted.",
        { educationId: experience.id, details: details.map(d => d.id) },
      );
      const result = await tx.detail.deleteMany({
        where: { entityType: DetailEntityType.EXPERIENCE, entityId: experience.id },
      });
      logger.info(`Deleted ${result.count} details associated with the experience being deleted.`, {
        educationId: experience.id,
      });
      logger.info(
        "Deleting nested details that are associated with the experience being deleted.",
        { educationId: experience.id },
      );
      const nestedResult = await tx.nestedDetail.deleteMany({
        where: { detailId: { in: details.map(d => d.id) } },
      });
      if (nestedResult.count !== 0) {
        logger.info(
          `Deleted ${nestedResult.count} nested details associated with the education ` +
            "being deleted.",
          { educationId: experience.id },
        );
      }
    }

    await tx.experience.delete({ where: { id } });
  });
};
