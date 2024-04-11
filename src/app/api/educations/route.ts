import { type NextRequest } from "next/server";

import { getAuthUserFromRequest } from "~/application/auth";
import { type EducationIncludes } from "~/prisma/model";
import { getEducations } from "~/actions/fetches/educations";
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
  const educations = await getEducations({
    includes: parseInclusion(request, [
      "courses",
      "skills",
      "details",
    ] as const) as EducationIncludes,
    visibility,
  });
  return ClientResponse.OK(educations).response;
}
