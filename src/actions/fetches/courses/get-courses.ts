import "server-only";

import { cache } from "react";

import { getClerkAuthedUser } from "~/application/auth/server";
import { prisma } from "~/database/prisma";
import { type ApiCourse, type CourseIncludes, fieldIsIncluded } from "~/database/model";

import { parsePagination, type ApiStandardListQuery } from "~/api/query";
import { convertToPlainObject } from "~/api/serialization";

import { PAGE_SIZES, constructTableSearchClause } from "../constants";

export type GetCoursesFilters = {
  readonly search: string;
};

export type GetCoursesParams<I extends CourseIncludes> = Omit<
  ApiStandardListQuery<I, GetCoursesFilters>,
  "orderBy" | "limit"
>;

const whereClause = ({
  filters,
  visibility,
}: Pick<GetCoursesParams<CourseIncludes>, "filters" | "visibility">) =>
  ({
    AND: filters?.search
      ? [
          constructTableSearchClause("course", filters.search),
          { visible: visibility === "public" ? true : undefined },
        ]
      : [{ visible: visibility === "public" ? true : undefined }],
  }) as const;

export const preloadCoursesCount = (
  params: Pick<GetCoursesParams<CourseIncludes>, "filters" | "visibility">,
) => {
  void getCoursesCount(params);
};

export const getCoursesCount = cache(
  async ({
    filters,
    visibility,
  }: Pick<GetCoursesParams<CourseIncludes>, "filters" | "visibility">) => {
    await getClerkAuthedUser({ strict: visibility === "admin" });
    return await prisma.course.count({
      where: whereClause({ filters, visibility }),
    });
  },
);

export const preloadCourses = <I extends CourseIncludes>(params: GetCoursesParams<I>) => {
  void getCourses(params);
};

export const getCourses = cache(
  async <I extends CourseIncludes>({
    includes,
    page,
    filters,
    visibility,
  }: GetCoursesParams<I>): Promise<ApiCourse<I>[]> => {
    await getClerkAuthedUser({ strict: visibility !== "public" });

    const pagination = await parsePagination({
      page,
      pageSize: PAGE_SIZES.course,
      getCount: async () => await getCoursesCount({ filters, visibility }),
    });

    const courses = await prisma.course.findMany({
      where: whereClause({ filters, visibility }),
      include: {
        /* Note: If the education is not visible and we are in the public context, we still return
           the skill - at least for right now. */
        education: fieldIsIncluded("education", includes)
          ? { include: { school: true } }
          : undefined,
        skills: fieldIsIncluded("skills", includes)
          ? { where: { visible: visibility === "public" ? true : undefined } }
          : undefined,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
      take: pagination ? pagination.pageSize : undefined,
    });
    return courses.map(convertToPlainObject) as ApiCourse<[]>[] as ApiCourse<I>[];
  },
) as {
  <I extends CourseIncludes>(params: GetCoursesParams<I>): Promise<ApiCourse<I>[]>;
};
