import "server-only";
import { cache } from "react";

import { prisma } from "~/prisma/client";
import { type School } from "~/prisma/model";

export const preloadSchools = () => {
  void getSchools();
};

export const getSchools = cache(
  (): Promise<School[]> =>
    prisma.school.findMany({
      orderBy: { updatedAt: "desc" },
    }),
);
