import "server-only";
import { cache } from "react";

import { getAuthAdminUser } from "~/application/auth";
import { prisma } from "~/prisma/client";
import {
  type ApiEducation,
  DetailEntityType,
  type EduIncludes,
  type EduSkill,
  type EduDetail,
} from "~/prisma/model";
import { constructOrSearch } from "~/prisma/util";
import { parsePagination } from "~/actions/pagination";
import { type Visibility } from "~/actions/visibility";

import { EDUCATIONS_ADMIN_TABLE_PAGE_SIZE } from "./constants";

const SEARCH_FIELDS = ["major", "concentration", "minor"] as const;

interface GetEducationsFilters {
  readonly search: string;
}

type GetEducationsParams<I extends EduIncludes> = {
  visibility?: Visibility;
  includes?: I;
  filters?: GetEducationsFilters;
  page?: number;
};

const whereClause = ({
  filters,
  visibility = "public",
}: Pick<GetEducationsParams<EduIncludes>, "visibility" | "filters">) =>
  ({
    AND:
      filters?.search && visibility === "public"
        ? [constructOrSearch(filters.search, [...SEARCH_FIELDS]), { visible: true }]
        : filters?.search
          ? [constructOrSearch(filters.search, [...SEARCH_FIELDS])]
          : visibility === "public"
            ? { visible: true }
            : undefined,
  }) as const;

export const preloadEducationsCount = (
  params: Pick<GetEducationsParams<EduIncludes>, "visibility" | "filters">,
) => {
  void getEducationsCount(params);
};

export const getEducationsCount = cache(
  async ({
    filters,
    visibility = "public",
  }: Pick<GetEducationsParams<EduIncludes>, "visibility" | "filters">) => {
    /* TODO: We have to figure out how to get this to render an API response, instead of throwing
       a hard error, in the case that this is being called from the context of a route handler. */
    await getAuthAdminUser({ strict: visibility === "admin" });
    return await prisma.education.count({
      where: whereClause({ filters, visibility }),
    });
  },
);

export const preloadEducations = <I extends EduIncludes>(params: GetEducationsParams<I>) => {
  void getEducations(params);
};

export const getEducations = cache(
  async <I extends EduIncludes>({
    visibility = "public",
    includes,
    filters,
    page,
  }: GetEducationsParams<I>): Promise<ApiEducation<I>[]> => {
    /* TODO: We have to figure out how to get this to render an API response, instead of throwing
       a hard error, in the case that this is being called from the context of a route handler. */
    await getAuthAdminUser({ strict: visibility === "admin" });

    const pagination = await parsePagination({
      page,
      filters,
      visibility,
      // TODO: This will eventually have to be dynamic, specified as a query parameter.
      pageSize: EDUCATIONS_ADMIN_TABLE_PAGE_SIZE,
      getCount: getEducationsCount,
    });

    const edus = await prisma.education.findMany({
      include: { school: true },
      where: whereClause({ filters, visibility }),
      orderBy: { startDate: "desc" },
      skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
      take: pagination ? pagination.pageSize : undefined,
    });

    let skills: EduSkill[] = [];
    if (includes?.skills === true) {
      skills = await prisma.skill.findMany({
        include: { educations: true },
        where: {
          visible: visibility === "public" ? true : undefined,
          educations: { some: { education: { id: { in: edus.map(e => e.id) } } } },
        },
      });
    }
    let details: EduDetail[] = [];
    if (includes?.details === true) {
      details = await prisma.detail.findMany({
        where: {
          visible: visibility === "public" ? true : undefined,
          entityType: DetailEntityType.EDUCATION,
          entityId: { in: edus.map(e => e.id) },
        },
        // Accounts for cases where multiple details were created at the same time due to seeding.
        include: { nestedDetails: { orderBy: [{ createdAt: "desc" }, { id: "desc" }] } },
        // Accounts for cases where multiple details were created at the same time due to seeding.
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });
    }

    const educations = edus.map((edu): ApiEducation<I> => {
      let modified: ApiEducation<I> = { ...edu } as ApiEducation<I>;
      if (includes?.skills === true) {
        modified = {
          ...modified,
          skills: skills.filter(s => s.educations.some(e => e.educationId === edu.id)),
        };
      }
      if (includes?.details === true) {
        modified = { ...modified, details: details.filter(d => d.entityId === edu.id) };
      }
      return modified as ApiEducation<I>;
    });

    return educations as ApiEducation<I>[];
  },
) as {
  <I extends EduIncludes>(params: GetEducationsParams<I>): Promise<ApiEducation<I>[]>;
};
