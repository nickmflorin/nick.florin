import { type NextRequest } from "next/server";

import { getAuthUserFromRequest } from "~/application/auth";
import { type CompanyIncludes } from "~/prisma/model";
import { getCompanies } from "~/actions/fetches/companies";
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
  const courses = await getCompanies({
    includes: parseInclusion(request, ["experiences"] as const) as CompanyIncludes,
    visibility,
  });
  return ClientResponse.OK(courses).response;
}
