import "server-only";
import { cache } from "react";

import { getClerkAuthedUser } from "~/application/auth/server";
import { prisma } from "~/prisma/client";
import { type ApiRepository, type RepositoryIncludes, fieldIsIncluded } from "~/prisma/model";
import { parsePagination, type ApiStandardListQuery } from "~/api/query";
import { convertToPlainObject } from "~/api/serialization";

import { PAGE_SIZES, constructTableSearchClause } from "../constants";

export type GetRepositoriesFilters = {
  readonly search: string;
};

export type GetRepositoriesParams<I extends RepositoryIncludes> = Omit<
  ApiStandardListQuery<I, GetRepositoriesFilters>,
  "orderBy" | "limit"
>;
const whereClause = ({ filters }: Pick<GetRepositoriesParams<RepositoryIncludes>, "filters">) =>
  ({
    AND: filters?.search ? [constructTableSearchClause("repository", filters.search)] : undefined,
  }) as const;

export const preloadRepositoriesCount = (
  params: Pick<GetRepositoriesParams<RepositoryIncludes>, "filters" | "visibility">,
) => {
  void getRepositoriesCount(params);
};

export const getRepositoriesCount = cache(
  async ({
    filters,
    visibility,
  }: Pick<GetRepositoriesParams<RepositoryIncludes>, "filters" | "visibility">) => {
    await getClerkAuthedUser({ strict: visibility === "admin" });
    return await prisma.repository.count({
      where: whereClause({ filters }),
    });
  },
);

export const preloadRepositories = <I extends RepositoryIncludes>(
  params: GetRepositoriesParams<I>,
) => {
  void getRepositories(params);
};

export const getRepositories = cache(
  async <I extends RepositoryIncludes>({
    includes,
    page,
    filters,
    visibility,
  }: GetRepositoriesParams<I>): Promise<ApiRepository<I>[]> => {
    await getClerkAuthedUser({ strict: visibility === "admin" });

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
  <I extends RepositoryIncludes>(params: GetRepositoriesParams<I>): Promise<ApiRepository<I>[]>;
};
