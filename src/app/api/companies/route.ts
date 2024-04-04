import { type NextRequest } from "next/server";

import { getAuthAdminUser } from "~/application/auth";
import { type CompanyIncludes } from "~/prisma/model";
import { getCompanies } from "~/actions/fetches/companies";
import { ClientResponse } from "~/api";
import { parseInclusion } from "~/api/query";

export async function GET(request: NextRequest) {
  await getAuthAdminUser();
  const companies = await getCompanies({
    includes: parseInclusion(request, ["experiences"] as const) as CompanyIncludes,
  });
  return ClientResponse.OK(companies).response;
}
