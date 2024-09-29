import { type NextRequest } from "next/server";

import { z } from "zod";

import type { CourseIncludes } from "~/database/model";
import { parseOrdering } from "~/lib/ordering";

import {
  CoursesFiltersObj,
  CoursesDefaultOrdering,
  CourseOrderableFields,
  CourseIncludesSchema,
} from "~/actions";
import { fetchCourses } from "~/actions/courses/fetch-courses";
import { ClientResponse } from "~/api";
import { parseQueryParams } from "~/integrations/http";

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;

  const query = parseQueryParams(searchParams.toString());
  const parsed = CourseIncludesSchema.safeParse(query.includes);

  const limit = z.coerce.number().int().positive().safeParse(query.limit).data;
  const visibility =
    z
      .union([z.literal("admin"), z.literal("public")])
      .default("public")
      .safeParse(query.visibility).data ?? "public";

  let includes: CourseIncludes = [];
  if (parsed.success) {
    includes = parsed.data;
  }

  const filters = CoursesFiltersObj.parse(query);

  const ordering = parseOrdering(query, {
    defaultOrdering: CoursesDefaultOrdering,
    fields: [...CourseOrderableFields],
  });

  const fetcher = fetchCourses(includes);
  const { error, data } = await fetcher({ filters, ordering, limit, visibility }, { scope: "api" });
  if (error) {
    return error.response;
  }
  return ClientResponse.OK(data).response;
};
