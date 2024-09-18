import "server-only";

import { cache } from "react";

import { getClerkAuthedUser } from "~/application/auth/server";
import { type ApiRepository, type RepositoryIncludes, fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";
import { conditionalAndClause } from "~/database/util";

import { parsePagination, type ApiStandardListQuery } from "~/api/query";
import { convertToPlainObject } from "~/api/serialization";

import { PAGE_SIZES, constructTableSearchClause } from "../constants";

export type GetRepositoriesFilters = {
  readonly search: string;
  readonly highlighted: boolean;
};

export type GetRepositoriesParams<I extends RepositoryIncludes> = Omit<
  ApiStandardListQuery<I, Partial<GetRepositoriesFilters>>,
  "orderBy" | "limit"
>;

const whereClause = ({
  filters,
  visibility,
}: Pick<GetRepositoriesParams<RepositoryIncludes>, "filters" | "visibility">) =>
  conditionalAndClause([
    { clause: { visible: true }, condition: visibility === "public" },
    filters?.search ? constructTableSearchClause("repository", filters.search) : null,
    filters?.highlighted !== undefined ? { highlighted: filters.highlighted } : null,
  ]);

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
    return await db.repository.count({
      where: whereClause({ filters, visibility }),
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

    const repositories = await db.repository.findMany({
      where: whereClause({ filters, visibility }),
      include: {
        projects: fieldIsIncluded("projects", includes),
        skills: fieldIsIncluded("skills", includes)
          ? { where: { visible: visibility === "public" ? true : undefined } }
          : undefined,
      },
      orderBy: [{ startDate: "desc" }, { createdAt: "desc" }, { id: "desc" }],
      skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
      take: pagination ? pagination.pageSize : undefined,
    });
    return repositories.map(convertToPlainObject) as ApiRepository<[]>[] as ApiRepository<I>[];
  },
) as {
  <I extends RepositoryIncludes>(params: GetRepositoriesParams<I>): Promise<ApiRepository<I>[]>;
};
