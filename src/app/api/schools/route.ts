import { type NextRequest } from "next/server";

import { getAuthAdminUserFromRequest } from "~/application/auth";
import { ClientResponse } from "~/application/http";
import { getSchools } from "~/actions/fetches/get-schools";

export async function GET(request: NextRequest) {
  await getAuthAdminUserFromRequest(request);
  const schools = await getSchools();
  return ClientResponse.OK(schools).toResponse();
}
