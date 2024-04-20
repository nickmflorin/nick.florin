import { type CourseIncludes } from "~/prisma/model";
import { getCourses } from "~/actions/fetches/courses";
import { ClientResponse } from "~/api";
import { apiRoute } from "~/api/route";

export const GET = apiRoute(async (request, params, query) => {
  const courses = await getCourses({
    includes: query.includes as CourseIncludes,
    visibility: query.visibility,
  });
  return ClientResponse.OK(courses).response;
});
