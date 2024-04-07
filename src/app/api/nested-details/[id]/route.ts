import { type NextRequest } from "next/server";

import { prisma } from "~/prisma/client";
import { type NestedDetailIncludes } from "~/prisma/model";
import { getNestedDetail } from "~/actions/fetches/details";
import { ApiClientGlobalError, ClientResponse } from "~/api";
import { parseInclusion } from "~/api/query";

export async function generateStaticParams() {
  const details = await prisma.nestedDetail.findMany();
  return details.map(e => ({
    id: e.id,
  }));
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const detail = await getNestedDetail(params.id, {
    includes: parseInclusion(request, ["skills"] as const) as NestedDetailIncludes,
  });
  if (!detail) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK(detail).response;
}
