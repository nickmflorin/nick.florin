import "server-only";

import { cache } from "react";

import { getClerkAuthedUser } from "~/application/auth/server";
import { logger } from "~/internal/logger";
import { prisma, type Transaction } from "~/database/prisma";
import { type BrandResume } from "~/database/model";

import { convertToPlainObject } from "~/api/serialization";

export const preloadResumes = () => {
  void getResumes();
};

export const getResumes = cache(async (tx?: Transaction): Promise<BrandResume[]> => {
  await getClerkAuthedUser({ strict: true });

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
