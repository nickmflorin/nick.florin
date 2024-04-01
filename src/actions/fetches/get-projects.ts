import "server-only";
import { cache } from "react";

import { prisma } from "~/prisma/client";
import { type Project } from "~/prisma/model";

export const preloadProjects = () => {
  void getProjects();
};

export const getProjects = cache(
  (): Promise<Project[]> =>
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
    }),
);
