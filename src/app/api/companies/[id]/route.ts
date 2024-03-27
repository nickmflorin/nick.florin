import { type NextRequest } from "next/server";

import { prisma } from "~/prisma/client";
import { getCompany } from "~/actions/fetches/get-company";
import { ApiClientGlobalError, ClientResponse } from "~/http";

export async function generateStaticParams() {
  const companies = await prisma.company.findMany();
  return companies.map(c => ({
    id: c.id,
  }));
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const company = await getCompany(params.id);
  if (!company) {
    return ApiClientGlobalError.NotFound().toResponse();
  }
  return ClientResponse.OK(company).toResponse();
}
