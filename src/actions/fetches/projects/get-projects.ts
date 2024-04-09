import "server-only";
import { cache } from "react";

import { getAuthAdminUser } from "~/application/auth";
import { prisma } from "~/prisma/client";
import { type ApiProject, type ProjectIncludes, fieldIsIncluded } from "~/prisma/model";
import { convertToPlainObject } from "~/actions/fetches/serialization";
import { parsePagination } from "~/api/query";

import { PAGE_SIZES, constructTableSearchClause } from "../constants";

interface GetProjectsFilters {
  readonly search: string;
}

type GetProjectsParams<I extends ProjectIncludes> = {
  includes?: I;
  filters?: GetProjectsFilters;
  page?: number;
};

const whereClause = ({ filters }: Pick<GetProjectsParams<ProjectIncludes>, "filters">) =>
  ({
    AND: filters?.search ? [constructTableSearchClause("project", filters.search)] : undefined,
  }) as const;

export const preloadProjectsCount = (
  params: Pick<GetProjectsParams<ProjectIncludes>, "filters">,
) => {
  void getProjectsCount(params);
};

export const getProjectsCount = cache(
  async ({ filters }: Pick<GetProjectsParams<ProjectIncludes>, "filters">) => {
    /* TODO: We have to figure out how to get this to render an API response, instead of throwing
       a hard error, in the case that this is being called from the context of a route handler.

       Note: Right now, this is only used for the admin, so visibility is not applicable. */
    await getAuthAdminUser({ strict: true });
    return await prisma.project.count({
      where: whereClause({ filters }),
    });
  },
);

export const preloadProjects = <I extends ProjectIncludes>({ includes }: { includes: I }) => {
  void getProjects({ includes });
};

export const getProjects = cache(
  async <I extends ProjectIncludes>({
    includes,
    page,
    filters,
  }: GetProjectsParams<I>): Promise<ApiProject<I>[]> => {
    /* TODO: We have to figure out how to get this to render an API response, instead of throwing
       a hard error, in the case that this is being called from the context of a route handler.

       Note: Right now, this is only used for the admin, so visibility is not applicable. */
    await getAuthAdminUser({ strict: true });

    const pagination = await parsePagination({
      page,
      pageSize: PAGE_SIZES.project,
      getCount: async () => await getProjectsCount({ filters }),
    });

    const projects = await prisma.project.findMany({
      where: whereClause({ filters }),
      include: { skills: fieldIsIncluded("skills", includes) ? true : undefined },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
      take: pagination ? pagination.pageSize : undefined,
    });
    if (fieldIsIncluded("skills", includes)) {
      const skills = await prisma.skill.findMany({
        where: { projects: { some: { projectId: { in: projects.map(p => p.id) } } } },
      });
      return projects.map(
        (project): ApiProject<["skills"]> =>
          convertToPlainObject({
            ...project,
            skills: skills.filter(skill => project.skills.some(sk => sk.skillId === skill.id)),
          }),
      ) as ApiProject<I>[];
    }
    return projects.map(convertToPlainObject) as ApiProject<[]>[] as ApiProject<I>[];
  },
) as {
  <I extends ProjectIncludes>(params: GetProjectsParams<I>): Promise<ApiProject<I>[]>;
};
