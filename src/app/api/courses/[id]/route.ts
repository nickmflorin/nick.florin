import { prisma } from "~/database/prisma";
import { type CourseIncludes } from "~/database/model";

import { getCourse } from "~/actions/fetches/courses";
import { ClientResponse, ApiClientGlobalError } from "~/api";
import { apiRoute } from "~/api/route";

export async function generateStaticParams() {
  const courses = await prisma.course.findMany();
  return courses.map(c => ({
    id: c.id,
  }));
}

export const GET = apiRoute(async (request, { params }: { params: { id: string } }, query) => {
  const course = await getCourse(params.id, {
    includes: query.includes as CourseIncludes,
    visibility: query.visibility,
  });
  if (!course) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK(course).response;
});
