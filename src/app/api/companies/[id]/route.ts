import { type NextRequest } from "next/server";

import { getAuthUserFromRequest } from "~/application/auth";
import { prisma } from "~/prisma/client";
import { type CompanyIncludes } from "~/prisma/model";
import { getCompany } from "~/actions/fetches/companies";
import { ClientResponse, ApiClientGlobalError } from "~/api";
import { parseInclusion, parseVisibility } from "~/api/query";

export async function generateStaticParams() {
  const companies = await prisma.company.findMany();
  return companies.map(c => ({
    id: c.id,
  }));
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const visibility = parseVisibility(request);
  if (visibility === "admin") {
    const user = await getAuthUserFromRequest(request);
    if (!user) {
      return ApiClientGlobalError.NotAuthenticated().response;
    } else if (!user.isAdmin) {
      return ApiClientGlobalError.Forbidden().response;
    }
  }
  const company = await getCompany(params.id, {
    includes: parseInclusion(request, ["experiences"]) as CompanyIncludes,
    visibility,
  });
  if (!company) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK(company).response;
}
