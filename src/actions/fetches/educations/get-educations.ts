import "server-only";
import { cache } from "react";

import omit from "lodash.omit";

import { getAuthAdminUser } from "~/application/auth";
import { prisma } from "~/prisma/client";
import {
  type ApiEducation,
  DetailEntityType,
  type EduIncludes,
  type ApiDetail,
  type BrandSkill,
  type EducationOnSkills,
  type BrandCourse,
  fieldIsIncluded,
} from "~/prisma/model";
import { constructOrSearch } from "~/prisma/util";
import { convertToPlainObject } from "~/actions/fetches/serialization";
import { parsePagination, type Visibility } from "~/api/query";

import { EDUCATIONS_ADMIN_TABLE_PAGE_SIZE } from "../constants";
import { getDetails } from "../details";

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
      // TODO: This will eventually have to be dynamic, specified as a query parameter.
      pageSize: EDUCATIONS_ADMIN_TABLE_PAGE_SIZE,
      getCount: async () => await getEducationsCount({ filters, visibility }),
    });

    const edus = await prisma.education.findMany({
      include: { school: true },
      where: whereClause({ filters, visibility }),
      orderBy: { startDate: "desc" },
      skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
      take: pagination ? pagination.pageSize : undefined,
    });

    let skills: (BrandSkill & { readonly educations: EducationOnSkills[] })[] | undefined =
      undefined;
    if (fieldIsIncluded("skills", includes)) {
      skills = await prisma.skill.findMany({
        include: { educations: true },
        where: {
          visible: visibility === "public" ? true : undefined,
          educations: { some: { education: { id: { in: edus.map(e => e.id) } } } },
        },
      });
    }

    let courses: BrandCourse[] | undefined = undefined;
    if (fieldIsIncluded("courses", includes)) {
      courses = await prisma.course.findMany({
        where: {
          visible: visibility === "public" ? true : undefined,
          educationId: { in: edus.map(e => e.id) },
        },
      });
    }

    let details: ApiDetail<["nestedDetails", "skills"]>[] | undefined = undefined;
    if (fieldIsIncluded("details", includes)) {
      details = await getDetails(
        edus.map(e => e.id),
        DetailEntityType.EDUCATION,
        { visibility, includes: ["nestedDetails", "skills"] },
      );
    }

    const educations = edus.map((edu): ApiEducation<I> => {
      let modified: ApiEducation<I> = { ...edu } as ApiEducation<I>;
      if (skills) {
        modified = {
          ...modified,
          skills: skills
            .filter(s => s.educations.some(e => e.educationId === edu.id))
            .map(s => omit(s, "educations")),
        };
      }
      if (details) {
        modified = { ...modified, details: details.filter(d => d.entityId === edu.id) };
      }
      if (courses) {
        modified = { ...modified, courses: courses.filter(c => c.educationId === edu.id) };
      }
      return convertToPlainObject(modified) as ApiEducation<I>;
    });
    return educations.map(convertToPlainObject) as ApiEducation<I>[];
  },
) as {
  <I extends EduIncludes>(params: GetEducationsParams<I>): Promise<ApiEducation<I>[]>;
};
