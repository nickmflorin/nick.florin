import { type NextRequest } from "next/server";

import { getAuthUserFromRequest } from "~/application/auth";
import { prisma } from "~/prisma/client";
import { type RepositoryIncludes } from "~/prisma/model";
import { getRepository } from "~/actions/fetches/repositories";
import { ClientResponse, ApiClientGlobalError } from "~/api";
import { parseInclusion, parseVisibility } from "~/api/query";

export async function generateStaticParams() {
  const repositories = await prisma.repository.findMany();
  return repositories.map(r => ({
    id: r.id,
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
  const repository = await getRepository(params.id, {
    includes: parseInclusion(request, ["projects", "skills"]) as RepositoryIncludes,
    visibility,
  });
  if (!repository) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK(repository).response;
}
