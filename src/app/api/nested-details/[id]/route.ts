import { type NextRequest } from "next/server";

import { getAuthUserFromRequest } from "~/application/auth";
import { prisma } from "~/prisma/client";
import { type NestedDetailIncludes } from "~/prisma/model";
import { getNestedDetail } from "~/actions/fetches/details";
import { ClientResponse, ApiClientGlobalError } from "~/api";
import { parseInclusion, parseVisibility } from "~/api/query";

export async function generateStaticParams() {
  const details = await prisma.detail.findMany();
  return details.map(c => ({
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
  const detail = await getNestedDetail(params.id, {
    includes: parseInclusion(request, ["skills"]) as NestedDetailIncludes,
    visibility,
  });
  if (!detail) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK(detail).response;
}
