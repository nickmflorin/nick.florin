import { type NextRequest } from "next/server";

import { getAuthUserFromRequest } from "~/application/auth";
import { getProjects } from "~/actions/fetches/get-projects";
import { ApiClientGlobalError, ClientResponse } from "~/api";

export async function GET(request: NextRequest) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return ApiClientGlobalError.NotAuthenticated().response;
  } else if (user && !user.isAdmin) {
    return ApiClientGlobalError.Forbidden().response;
  }
  const projects = await getProjects();
  return ClientResponse.OK(projects).response;
}
