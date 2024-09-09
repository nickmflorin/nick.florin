import { prisma } from "~/prisma/client";
import { type CompanyIncludes } from "~/prisma/model";

import { getCompany } from "~/actions/fetches/companies";
import { ClientResponse, ApiClientGlobalError } from "~/api";
import { apiRoute } from "~/api/route";

export async function generateStaticParams() {
  const companies = await prisma.company.findMany();
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
