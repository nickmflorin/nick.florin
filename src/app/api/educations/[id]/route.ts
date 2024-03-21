import { type NextRequest } from "next/server";

import { getEducation } from "~/actions/fetches/get-education";
import { ApiClientGlobalError, ClientResponse } from "~/api";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const education = await getEducation(params.id);
  if (!education) {
    return ApiClientGlobalError.NotFound().toResponse();
  }
  return ClientResponse.OK(education).toResponse();
}
