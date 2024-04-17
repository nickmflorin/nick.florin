import { type NextRequest } from "next/server";

import { getAuthUserFromRequest } from "~/application/auth";
import { type ProjectIncludes } from "~/prisma/model";
import { getProjects } from "~/actions/fetches/projects";
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
  const courses = await getProjects({
    includes: parseInclusion(request, [
      "repositories",
      "skills",
      "details",
      "nestedDetails",
    ] as const) as ProjectIncludes,
    visibility,
  });
  return ClientResponse.OK(courses).response;
}
