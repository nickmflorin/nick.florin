import "server-only";
import { cache } from "react";

import { prisma } from "~/prisma/client";
import { type Company } from "~/prisma/model";

export const preloadCompanies = () => {
  void getCompanies();
};

export const getCompanies = cache(
  (): Promise<Company[]> =>
    prisma.company.findMany({
      orderBy: { updatedAt: "desc" },
    }),
);
