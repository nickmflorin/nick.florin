import { type NextRequest } from "next/server";

import { prisma } from "~/prisma/client";
import { DetailEntityType, type DetailIncludes } from "~/prisma/model";
import { getEntityDetails } from "~/actions/fetches/details";
import { ApiClientGlobalError, ClientResponse } from "~/api";
import { parseInclusion } from "~/api/query";

export async function generateStaticParams() {
  const educations = await prisma.education.findMany();
  return educations.map(e => ({
    id: e.id,
  }));
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const details = await getEntityDetails(params.id, DetailEntityType.EDUCATION, {
    includes: parseInclusion(request, ["nestedDetails", "skills"] as const) as DetailIncludes,
  });
  if (!details) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK({ details: details.details, education: details.entity }).response;
}
