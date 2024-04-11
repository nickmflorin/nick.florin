import { type NextRequest } from "next/server";

import { getAuthUserFromRequest } from "~/application/auth";
import { type RepositoryIncludes } from "~/prisma/model";
import { getRepositorys } from "~/actions/fetches/repositories";
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
  const repositories = await getRepositorys({
    includes: parseInclusion(request, ["projects", "skills"] as const) as RepositoryIncludes,
    visibility,
  });
  return ClientResponse.OK(repositories).response;
}
