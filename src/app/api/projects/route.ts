import { type NextRequest } from "next/server";

import { getAuthUserFromRequest } from "~/application/auth";
import { type ProjectIncludes } from "~/prisma/model";
import { getProjects } from "~/actions/fetches/projects";
import { ApiClientGlobalError, ClientResponse } from "~/api";
import { parseInclusion } from "~/api/query";

export async function GET(request: NextRequest) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return ApiClientGlobalError.NotAuthenticated().response;
  } else if (user && !user.isAdmin) {
    return ApiClientGlobalError.Forbidden().response;
  }
  const projects = await getProjects({
    includes: parseInclusion(request, ["skills"]) as ProjectIncludes,
  });
  return ClientResponse.OK(projects).response;
}
