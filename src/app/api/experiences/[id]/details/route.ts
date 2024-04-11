import { type NextRequest } from "next/server";

import { getAuthUserFromRequest } from "~/application/auth";
import { prisma } from "~/prisma/client";
import { DetailEntityType, type DetailIncludes } from "~/prisma/model";
import { getEntityDetails } from "~/actions/fetches/details";
import { ApiClientGlobalError, ClientResponse } from "~/api";
import { parseInclusion, parseVisibility } from "~/api/query";

export async function generateStaticParams() {
  const experiences = await prisma.experience.findMany();
  return experiences.map(e => ({
    id: e.id,
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
  const detail = await getEntityDetails(params.id, DetailEntityType.EXPERIENCE, {
    includes: parseInclusion(request, ["nestedDetails", "skills"]) as DetailIncludes,
    visibility,
  });
  if (!detail) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK(detail).response;
}
