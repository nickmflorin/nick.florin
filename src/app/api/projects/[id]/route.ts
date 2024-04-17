import { type NextRequest } from "next/server";

import { getAuthUserFromRequest } from "~/application/auth";
import { prisma } from "~/prisma/client";
import { type ProjectIncludes } from "~/prisma/model";
import { getProject } from "~/actions/fetches/projects";
import { ClientResponse, ApiClientGlobalError } from "~/api";
import { parseInclusion, parseVisibility } from "~/api/query";

export async function generateStaticParams() {
  const projects = await prisma.project.findMany();
  return projects.map(p => ({
    id: p.id,
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
  const project = await getProject(params.id, {
    includes: parseInclusion(request, [
      "repositories",
      "skills",
      "details",
      "nestedDetails",
    ]) as ProjectIncludes,
    visibility,
  });
  if (!project) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK(project).response;
}
