import "server-only";
import { cache } from "react";

import { prisma } from "~/prisma/client";
import { type School } from "~/prisma/model";

export const preloadSchools = () => {
  void getSchools();
};

export const getSchools = cache(
  async (): Promise<School[]> =>
    await prisma.school.findMany({
      orderBy: { updatedAt: "desc" },
    }),
);
