import { type NextRequest } from "next/server";

import { getAuthUserFromRequest } from "~/application/auth";
import { getEducations } from "~/actions/fetches/get-educations";
import { parseVisibility } from "~/actions/visibility";
import { ApiClientGlobalError, ClientResponse } from "~/http";

export async function GET(request: NextRequest) {
  const visibility = parseVisibility(request);

  const user = await getAuthUserFromRequest(request);
  if (!user && visibility === "admin") {
    return ApiClientGlobalError.NotAuthenticated().toResponse();
  } else if (user && !user.isAdmin && visibility === "admin") {
    return ApiClientGlobalError.Forbidden().toResponse();
  }
  const educations = await getEducations({ visibility });

  return ClientResponse.OK(educations).toResponse();
}
