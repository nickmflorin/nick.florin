import { type NextRequest } from "next/server";

import { getAuthUserFromRequest } from "~/application/auth";
import { type ExperienceIncludes } from "~/prisma/model";
import { getExperiences } from "~/actions/fetches/experiences";
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
  const experiences = await getExperiences({
    includes: parseInclusion(request, ["skills", "details"] as const) as ExperienceIncludes,
    visibility,
  });
  return ClientResponse.OK(experiences).response;
}
