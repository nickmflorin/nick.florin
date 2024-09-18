"use server";
import { del } from "@vercel/blob";

import { getAuthedUser } from "~/application/auth/server";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/database/prisma";
import { type BrandResume } from "~/database/model";

import { getResumes } from "~/actions/fetches/resumes";
import { ApiClientGlobalError } from "~/api";

export const deleteResume = async (id: string): Promise<BrandResume[]> => {
  await getAuthedUser({ strict: true });

  return await prisma.$transaction(async tx => {
    let resume: BrandResume;
    try {
      resume = await tx.resume.findUniqueOrThrow({ where: { id } });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        throw ApiClientGlobalError.NotFound();
      }
      throw e;
    }

    await tx.resume.delete({ where: { id: resume.id } });
    /* TODO: We may want to log a warning if we are deleing a resume that exists in the DB but not
       in the blob storage... We would have to use the 'list' method. */
    await del(resume.url);

    /* Deleting a resume can cause the prioritization flag to switch if there were multiple resumes
       with 'primary' set to 'true'. */
    return getResumes(tx);
  });
};
