import "server-only";
import { cache } from "react";

import { getAuthAdminUser } from "~/application/auth";
import { prisma } from "~/prisma/client";
import { type ApiProject, type ProjectIncludes, fieldIsIncluded } from "~/prisma/model";
import { parsePagination, type Visibility } from "~/api/query";
import { convertToPlainObject } from "~/api/serialization";

import { PAGE_SIZES, constructTableSearchClause } from "../constants";

interface GetProjectsFilters {
  readonly search: string;
}

type GetProjectsParams<I extends ProjectIncludes> = {
  includes: I;
  filters?: GetProjectsFilters;
  page?: number;
  visibility: Visibility;
};

const whereClause = ({ filters }: Pick<GetProjectsParams<ProjectIncludes>, "filters">) =>
  ({
    AND: filters?.search ? [constructTableSearchClause("project", filters.search)] : undefined,
  }) as const;

export const preloadProjectsCount = (
  params: Pick<GetProjectsParams<ProjectIncludes>, "filters" | "visibility">,
) => {
  void getProjectsCount(params);
};

export const getProjectsCount = cache(
  /* Visibility is not applicable at the top project level, only for skills nested underneath the
     Project. */
  async ({
    filters,
    visibility,
  }: Pick<GetProjectsParams<ProjectIncludes>, "filters" | "visibility">) => {
    await getAuthAdminUser({ strict: visibility === "admin" });
    return await prisma.project.count({
      where: whereClause({ filters }),
    });
  },
);

export const preloadProjects = <I extends ProjectIncludes>(params: GetProjectsParams<I>) => {
  void getProjects(params);
};

export const getProjects = cache(
  async <I extends ProjectIncludes>({
    includes,
    page,
    filters,
    visibility,
  }: GetProjectsParams<I>): Promise<ApiProject<I>[]> => {
    await getAuthAdminUser({ strict: visibility === "admin" });

    const pagination = await parsePagination({
      page,
      pageSize: PAGE_SIZES.project,
      getCount: async () => await getProjectsCount({ filters, visibility }),
    });

    const projects = await prisma.project.findMany({
      where: whereClause({ filters }),
      include: {
        repositories: fieldIsIncluded("repositories", includes)
          ? { where: { visible: visibility === "public" ? true : undefined } }
          : undefined,
        skills: fieldIsIncluded("skills", includes)
          ? { where: { visible: visibility === "public" ? true : undefined } }
          : undefined,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
      take: pagination ? pagination.pageSize : undefined,
    });
    return projects.map(convertToPlainObject) as ApiProject<[]>[] as ApiProject<I>[];
  },
) as {
  <I extends ProjectIncludes>(params: GetProjectsParams<I>): Promise<ApiProject<I>[]>;
};
