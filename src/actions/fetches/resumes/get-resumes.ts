import "server-only";
import { cache } from "react";

import { getAuthAdminUser } from "~/application/auth";
import { logger } from "~/application/logger";
import { prisma, type Transaction } from "~/prisma/client";
import { type ApiResume } from "~/prisma/model";
import { convertToPlainObject } from "~/api/serialization";

export const preloadResumes = () => {
  void getResumes();
};

export const getResumes = cache(async (tx?: Transaction): Promise<ApiResume<["primary"]>[]> => {
  await getAuthAdminUser({ strict: true });

  const trans = tx ?? prisma;

  const resumes = await trans.resume.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  const exposed = resumes.filter(r => r.exposed === true);
  if (exposed.length === 0) {
    return [
      { ...resumes[0], primary: true },
      ...resumes.slice(1).map(r => ({ ...r, primary: false })),
    ].map(convertToPlainObject);
  } else if (exposed.length === 1) {
    return resumes
      .map(r => (r.exposed ? { ...r, primary: true } : { ...r, primary: false }))
      .map(convertToPlainObject);
  } else {
    logger.warn("Encountered multiple resumes with the 'exposed' flag set to 'true'.", {
      resumes: exposed.map(r => r.id),
    });
    return resumes
      .map(r => (r.id === exposed[0].id ? { ...r, primary: true } : { ...r, primary: false }))
      .map(convertToPlainObject);
  }
});
