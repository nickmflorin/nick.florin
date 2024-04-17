import "server-only";
import { cache } from "react";

import { getAuthAdminUser } from "~/application/auth";
import { prisma } from "~/prisma/client";
import { type ApiRepository, type RepositoryIncludes, fieldIsIncluded } from "~/prisma/model";
import { parsePagination, type Visibility } from "~/api/query";
import { convertToPlainObject } from "~/api/serialization";

import { PAGE_SIZES, constructTableSearchClause } from "../constants";

interface GetRepositorysFilters {
  readonly search: string;
}

type GetRepositorysParams<I extends RepositoryIncludes> = {
  includes: I;
  filters?: GetRepositorysFilters;
  page?: number;
  visibility: Visibility;
};

const whereClause = ({ filters }: Pick<GetRepositorysParams<RepositoryIncludes>, "filters">) =>
  ({
    AND: filters?.search ? [constructTableSearchClause("repository", filters.search)] : undefined,
  }) as const;

export const preloadRepositoriesCount = (
  params: Pick<GetRepositorysParams<RepositoryIncludes>, "filters" | "visibility">,
) => {
  void getRepositoriesCount(params);
};

export const getRepositoriesCount = cache(
  async ({
    filters,
    visibility,
  }: Pick<GetRepositorysParams<RepositoryIncludes>, "filters" | "visibility">) => {
    await getAuthAdminUser({ strict: visibility === "admin" });
    return await prisma.repository.count({
      where: whereClause({ filters }),
    });
  },
);

export const preloadRepositories = <I extends RepositoryIncludes>(
  params: GetRepositorysParams<I>,
) => {
  void getRepositories(params);
};

export const getRepositories = cache(
  async <I extends RepositoryIncludes>({
    includes,
    page,
    filters,
    visibility,
  }: GetRepositorysParams<I>): Promise<ApiRepository<I>[]> => {
    await getAuthAdminUser({ strict: visibility === "admin" });

    const pagination = await parsePagination({
      page,
      pageSize: PAGE_SIZES.repository,
      getCount: async () => await getRepositoriesCount({ filters, visibility }),
    });

    const repositories = await prisma.repository.findMany({
      where: whereClause({ filters }),
      include: {
        projects: fieldIsIncluded("projects", includes),
        skills: fieldIsIncluded("skills", includes)
          ? { where: { visible: visibility === "public" ? true : undefined } }
          : undefined,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
      take: pagination ? pagination.pageSize : undefined,
    });
    return repositories.map(convertToPlainObject) as ApiRepository<[]>[] as ApiRepository<I>[];
  },
) as {
  <I extends RepositoryIncludes>(params: GetRepositorysParams<I>): Promise<ApiRepository<I>[]>;
};
