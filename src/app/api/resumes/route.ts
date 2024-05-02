import { type NextRequest } from "next/server";

import { getClerkUser } from "~/application/auth/server";
import { getResumes } from "~/actions/fetches/resumes";
import { ApiClientGlobalError, ClientResponse } from "~/api";

export async function GET(request: NextRequest) {
  const { clerkUserId, hasCMSAccess } = await getClerkUser(request);
  if (!clerkUserId) {
    return ApiClientGlobalError.NotAuthenticated().response;
  } else if (!hasCMSAccess) {
    return ApiClientGlobalError.Forbidden().response;
  }
  const resumes = await getResumes();
  return ClientResponse.OK(resumes).response;
}
