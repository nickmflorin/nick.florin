import "server-only";
import { cache } from "react";

import { getAuthAdminUser } from "~/application/auth";
import { prisma } from "~/prisma/client";
import { type BrandResume } from "~/prisma/model";
import { convertToPlainObject } from "~/api/serialization";

export const preloadResumes = () => {
  void getResumes();
};

export const getResumes = cache(async (): Promise<BrandResume[]> => {
  await getAuthAdminUser({ strict: true });
  return (
    await prisma.resume.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    })
  ).map(convertToPlainObject);
});
