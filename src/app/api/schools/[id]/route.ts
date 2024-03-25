import { type NextRequest } from "next/server";

import { prisma } from "~/prisma/client";
import { getSchool } from "~/actions/fetches/get-school";
import { ApiClientGlobalError, ClientResponse } from "~/api";

export async function generateStaticParams() {
  const schools = await prisma.school.findMany();
  return schools.map(s => ({
    id: s.id,
  }));
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const school = await getSchool(params.id);
  if (!school) {
    return ApiClientGlobalError.NotFound().toResponse();
  }
  return ClientResponse.OK(school).toResponse();
}
