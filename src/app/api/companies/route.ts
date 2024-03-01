import { type NextRequest } from "next/server";

import { getAuthAdminUserFromRequest } from "~/application/auth";
import { ClientResponse } from "~/application/http";
import { getCompanies } from "~/actions/fetches/get-companies";

export async function GET(request: NextRequest) {
  await getAuthAdminUserFromRequest(request);
  const companies = await getCompanies();
  return ClientResponse.OK(companies).toResponse();
}
