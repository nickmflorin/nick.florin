"use server";
import { getAuthedUser } from "~/application/auth/server";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/database/prisma";
import type { BrandResume } from "~/database/model";

import { getResumes } from "~/actions/fetches/resumes";
import { ApiClientGlobalError, type ApiClientGlobalErrorJson } from "~/api";
import { convertToPlainObject } from "~/api/serialization";

export const prioritizeResume = async (
  id: string,
): Promise<{ resume: BrandResume; resumes: BrandResume[] } | ApiClientGlobalErrorJson> => {
  const { user } = await getAuthedUser({ strict: true });

  return await prisma.$transaction(async tx => {
    let resume: BrandResume;
    try {
      resume = await tx.resume.findUniqueOrThrow({
        where: { id },
      });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        throw ApiClientGlobalError.NotFound();
      }
      throw e;
    }
    const updated = await tx.resume.update({
      where: { id: resume.id },
      data: { primary: true, updatedById: user.id },
    });
    await tx.resume.updateMany({
      where: { id: { notIn: [updated.id] } },
      data: { primary: false, updatedById: user.id },
    });

    return {
      resume: convertToPlainObject({ ...updated, primary: true }),
      resumes: await getResumes(tx),
    };
  });
};
