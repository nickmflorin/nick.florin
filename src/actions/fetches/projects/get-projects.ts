import "server-only";
import { cache } from "react";

import { getClerkAuthedUser } from "~/application/auth/server";
import { prisma } from "~/prisma/client";
import { type ApiProject, type ProjectIncludes, fieldIsIncluded } from "~/prisma/model";
import { parsePagination, type ApiStandardListQuery } from "~/api/query";
import { convertToPlainObject } from "~/api/serialization";

import { PAGE_SIZES, constructTableSearchClause } from "../constants";

export type GetProjectsFilters = {
  readonly search: string;
};

export type GetProjectsParams<I extends ProjectIncludes> = Omit<
  ApiStandardListQuery<I, GetProjectsFilters>,
  "orderBy"
>;

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
    await getClerkAuthedUser({ strict: visibility === "admin" });
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
    /* Since all projects in the database are visible, and there is no visibility field on the
       model, visibility strictly applies to the nested includes for a project query - not the
       project itself. */
    visibility,
  }: GetProjectsParams<I>): Promise<ApiProject<I>[]> => {
    await getClerkAuthedUser({ strict: visibility === "admin" });

    const pagination = await parsePagination({
      page,
      pageSize: PAGE_SIZES.project,
      getCount: async () => await getProjectsCount({ filters, visibility }),
    });

    let projects = (await prisma.project.findMany({
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
    })) as ApiProject<I>[];

    if (fieldIsIncluded("details", includes)) {
      const details = await prisma.detail.findMany({
        where: { projectId: { in: projects.map(p => p.id) } },
      });
      projects = projects.map(proj => ({
        ...proj,
        details: details.filter(d => d.projectId === proj.id),
      }));
    }

    if (fieldIsIncluded("nestedDetails", includes)) {
      const nestedDetails = await prisma.nestedDetail.findMany({
        where: { projectId: { in: projects.map(p => p.id) } },
      });
      projects = projects.map(proj => ({
        ...proj,
        nestedDetails: nestedDetails.filter(d => d.projectId === proj.id),
      }));
    }

    return projects.map(convertToPlainObject);
  },
) as {
  <I extends ProjectIncludes>(params: GetProjectsParams<I>): Promise<ApiProject<I>[]>;
};
