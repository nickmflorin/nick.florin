import "server-only";
import { cache } from "react";

import { getAuthAdminUser } from "~/application/auth";
import { prisma } from "~/prisma/client";
import { type ApiCourse, type CourseIncludes, fieldIsIncluded } from "~/prisma/model";
import { convertToPlainObject } from "~/actions/fetches/serialization";
import { parsePagination } from "~/api/query";

import { PAGE_SIZES, constructTableSearchClause } from "../constants";

interface GetCoursesFilters {
  readonly search: string;
}

type GetCoursesParams<I extends CourseIncludes> = {
  includes?: I;
  filters?: GetCoursesFilters;
  page?: number;
};

const whereClause = ({ filters }: Pick<GetCoursesParams<CourseIncludes>, "filters">) =>
  ({
    AND: filters?.search ? [constructTableSearchClause("course", filters.search)] : undefined,
  }) as const;

export const preloadCoursesCount = (params: Pick<GetCoursesParams<CourseIncludes>, "filters">) => {
  void getCoursesCount(params);
};

export const getCoursesCount = cache(
  async ({ filters }: Pick<GetCoursesParams<CourseIncludes>, "filters">) => {
    /* TODO: We have to figure out how to get this to render an API response, instead of throwing
       a hard error, in the case that this is being called from the context of a route handler.

       Note: Right now, this is only used for the admin, so visibility is not applicable. */
    await getAuthAdminUser({ strict: true });
    return await prisma.project.count({
      where: whereClause({ filters }),
    });
  },
);

export const preloadCourses = <I extends CourseIncludes>({ includes }: { includes: I }) => {
  void getCourses({ includes });
};

export const getCourses = cache(
  async <I extends CourseIncludes>({
    includes,
    page,
    filters,
  }: GetCoursesParams<I>): Promise<ApiCourse<I>[]> => {
    /* TODO: We have to figure out how to get this to render an API response, instead of throwing
       a hard error, in the case that this is being called from the context of a route handler.

       Note: Right now, this is only used for the admin, so visibility is not applicable. */
    await getAuthAdminUser({ strict: true });

    const pagination = await parsePagination({
      page,
      pageSize: PAGE_SIZES.course,
      getCount: async () => await getCoursesCount({ filters }),
    });

    const courses = await prisma.course.findMany({
      where: whereClause({ filters }),
      include: {
        skills: fieldIsIncluded("skills", includes),
        education: fieldIsIncluded("education", includes),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
      take: pagination ? pagination.pageSize : undefined,
    });
    if (fieldIsIncluded("skills", includes)) {
      const skills = await prisma.skill.findMany({
        where: { courses: { some: { courseId: { in: courses.map(c => c.id) } } } },
      });
      return courses.map(
        (course): ApiCourse<["skills"]> => ({
          ...course,
          skills: skills.filter(skill => course.skills.some(sk => sk.skillId === skill.id)),
        }),
      ) as ApiCourse<I>[];
    }
    return courses.map(convertToPlainObject) as ApiCourse<[]>[] as ApiCourse<I>[];
  },
) as {
  <I extends CourseIncludes>(params: GetCoursesParams<I>): Promise<ApiCourse<I>[]>;
};
