import { type CompanyIncludes } from "~/database/model";
import { db } from "~/database/prisma";

import { getCompany } from "~/actions/fetches/companies";
import { ClientResponse, ApiClientGlobalError } from "~/api";
import { apiRoute } from "~/api/route";

export async function generateStaticParams() {
  const companies = await db.company.findMany();
  return companies.map(c => ({
    id: c.id,
  }));
}

export const GET = apiRoute(async (request, { params }: { params: { id: string } }, query) => {
  const company = await getCompany(params.id, {
    includes: query.includes as CompanyIncludes,
    visibility: query.visibility,
  });
  if (!company) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK(company).response;
});
