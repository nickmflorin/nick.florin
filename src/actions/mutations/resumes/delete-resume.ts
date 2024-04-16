"use server";
import { revalidatePath } from "next/cache";

import { del } from "@vercel/blob";

import { getAuthAdminUser } from "~/application/auth";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { type BrandResume } from "~/prisma/model";
import { getResumes } from "~/actions/fetches/resumes";
import { ApiClientGlobalError } from "~/api";

export const deleteResume = async (id: string): Promise<BrandResume[]> => {
  await getAuthAdminUser({ strict: true });

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
    await del(resume.url);

    revalidatePath("/api/resumes");
    /* Deleting a resume can cause the prioritization flag to switch if there were multiple resumes
       with 'primary' set to 'true'. */
    return getResumes(tx);
  });
};
