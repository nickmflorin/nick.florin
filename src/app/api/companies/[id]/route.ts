import { type NextRequest } from "next/server";

import { prisma } from "~/prisma/client";
import { getCompany } from "~/actions/fetches/companies";
import { ApiClientGlobalError, ClientResponse } from "~/api";

export async function generateStaticParams() {
  const companies = await prisma.company.findMany();
  return companies.map(c => ({
    id: c.id,
  }));
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const company = await getCompany(params.id);
  if (!company) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK(company).response;
}
