import { type NextRequest } from "next/server";

import type { CourseIncludes } from "~/database/model";
import { db } from "~/database/prisma";

import { CourseIncludesSchema } from "~/actions-v2";
import { fetchCourse } from "~/actions-v2/courses/fetch-course";
import { ClientResponse } from "~/api-v2";
import { parseQueryParams } from "~/integrations/http-v2";

export async function generateStaticParams() {
  const courses = await db.course.findMany();
  return courses.map(r => ({
    id: r.id,
  }));
}

export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
  const searchParams = request.nextUrl.searchParams;

  const query = parseQueryParams(searchParams.toString());
  const parsed = CourseIncludesSchema.safeParse(query.includes);

  let includes: CourseIncludes = [];
  if (parsed.success) {
    includes = parsed.data;
  }

  const fetcher = fetchCourse(includes);
  const { error, data } = await fetcher(params.id, { scope: "api" });
  if (error) {
    return error.response;
  }
  return ClientResponse.OK(data).response;
};
