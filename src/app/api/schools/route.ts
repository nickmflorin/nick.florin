import { type NextRequest } from "next/server";

import { getAuthUserFromRequest } from "~/application/auth";
import { type SchoolIncludes } from "~/prisma/model";
import { getSchools } from "~/actions/fetches/schools";
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
  const schools = await getSchools({
    includes: parseInclusion(request, ["educations"] as const) as SchoolIncludes,
    visibility,
  });
  return ClientResponse.OK(schools).response;
}
