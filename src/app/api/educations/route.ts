import { type NextRequest } from "next/server";

import { getAuthUserFromRequest } from "~/application/auth";
import { getEducations } from "~/actions/fetches/get-educations";
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
  const educations = await getEducations({ visibility });

  return ClientResponse.OK(educations).response;
}
