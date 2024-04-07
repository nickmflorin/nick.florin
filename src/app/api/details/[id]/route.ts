import { type NextRequest } from "next/server";

import { prisma } from "~/prisma/client";
import { type DetailIncludes } from "~/prisma/model";
import { getDetail } from "~/actions/fetches/details";
import { ApiClientGlobalError, ClientResponse } from "~/api";
import { parseInclusion } from "~/api/query";

export async function generateStaticParams() {
  const details = await prisma.detail.findMany();
  return details.map(e => ({
    id: e.id,
  }));
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const detail = await getDetail(params.id, {
    includes: parseInclusion(request, ["nestedDetails", "skills"] as const) as DetailIncludes,
  });
  if (!detail) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK(detail).response;
}
