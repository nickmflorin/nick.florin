import { type NextRequest } from "next/server";

import { getAuthUserFromRequest } from "~/application/auth";
import { getExperiences } from "~/actions/fetches/experiences";
import { ApiClientGlobalError, ClientResponse } from "~/api";
import { parseVisibility } from "~/api/visibility";

export async function GET(request: NextRequest) {
  const visibility = parseVisibility(request);

  const user = await getAuthUserFromRequest(request);
  if (!user && visibility === "admin") {
    return ApiClientGlobalError.NotAuthenticated().response;
  } else if (user && !user.isAdmin && visibility === "admin") {
    return ApiClientGlobalError.Forbidden().response;
  }
  const educations = await getExperiences({ visibility });

  return ClientResponse.OK(educations).response;
}
