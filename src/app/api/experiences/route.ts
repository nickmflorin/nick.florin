import { type NextRequest } from "next/server";

import { getAuthUserFromRequest } from "~/application/auth";
import { getExperiences } from "~/actions/fetches/get-experiences";
import { parseVisibility } from "~/actions/visibility";
import { ApiClientGlobalError, ClientResponse } from "~/api";

export async function GET(request: NextRequest) {
  const visibility = parseVisibility(request);

  const user = await getAuthUserFromRequest(request);
  if (!user && visibility === "admin") {
    return ApiClientGlobalError.NotAuthenticated().toResponse();
  } else if (user && !user.isAdmin && visibility === "admin") {
    return ApiClientGlobalError.Forbidden().toResponse();
  }
  const educations = await getExperiences({ visibility });

  return ClientResponse.OK(educations).toResponse();
}
