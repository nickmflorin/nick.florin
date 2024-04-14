import { type NextRequest } from "next/server";

import { getAuthUserFromRequest } from "~/application/auth";
import { getResumes } from "~/actions/fetches/resumes";
import { ApiClientGlobalError, ClientResponse } from "~/api";

export async function GET(request: NextRequest) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return ApiClientGlobalError.NotAuthenticated().response;
  } else if (!user.isAdmin) {
    return ApiClientGlobalError.Forbidden().response;
  }
  const resumes = await getResumes();
  return ClientResponse.OK(resumes).response;
}
