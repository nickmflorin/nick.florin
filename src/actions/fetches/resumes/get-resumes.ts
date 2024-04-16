import "server-only";
import { cache } from "react";

import { getAuthAdminUser } from "~/application/auth";
import { logger } from "~/application/logger";
import { prisma, type Transaction } from "~/prisma/client";
import { type BrandResume } from "~/prisma/model";
import { convertToPlainObject } from "~/api/serialization";

export const preloadResumes = () => {
  void getResumes();
};

export const getResumes = cache(async (tx?: Transaction): Promise<BrandResume[]> => {
  await getAuthAdminUser({ strict: true });

  const trans = tx ?? prisma;

  const resumes = await trans.resume.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  const primaries = resumes.filter(r => r.primary === true);
  /* If there are multiple primary resumes - this is a data inconsistency.  We will assume the
     most recently uploaded resume is the primary. */
  if (primaries.length > 1) {
    logger.warn("Encountered multiple resumes with the 'primary' flag set to 'true'.", {
      resumes: primaries.map(r => r.id),
    });
    return resumes
      .map(r => (r.id === primaries[0].id ? { ...r, primary: true } : { ...r, primary: false }))
      .map(convertToPlainObject);
  }
  return resumes.map(convertToPlainObject);
});
