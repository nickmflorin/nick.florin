import { type NextRequest } from "next/server";

import { getCompany } from "~/actions/fetches/get-company";
import { ApiClientGlobalError, ClientResponse } from "~/api";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const company = await getCompany(params.id);
  if (!company) {
    return ApiClientGlobalError.NotFound().toResponse();
  }
  return ClientResponse.OK(company).toResponse();
}
