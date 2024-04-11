import { type NextRequest } from "next/server";

import { getAuthUserFromRequest } from "~/application/auth";
import { type CourseIncludes } from "~/prisma/model";
import { getCourses } from "~/actions/fetches/courses";
import { ApiClientGlobalError, ClientResponse } from "~/api";
import { parseInclusion, parseVisibility } from "~/api/query";

export async function GET(request: NextRequest) {
  const visibility = parseVisibility(request);
  if (visibility === "admin") {
    const user = await getAuthUserFromRequest(request);
    if (!user) {
      return ApiClientGlobalError.NotAuthenticated().response;
    } else if (!user.isAdmin) {
      return ApiClientGlobalError.Forbidden().response;
    }
  }
  const courses = await getCourses({
    includes: parseInclusion(request, ["education", "skills"] as const) as CourseIncludes,
    visibility,
  });
  return ClientResponse.OK(courses).response;
}
