import { type NextRequest } from "next/server";

import { getAuthUserFromRequest } from "~/application/auth";
import { prisma } from "~/prisma/client";
import { type SchoolIncludes } from "~/prisma/model";
import { getSchool } from "~/actions/fetches/schools";
import { ClientResponse, ApiClientGlobalError } from "~/api";
import { parseInclusion, parseVisibility } from "~/api/query";

export async function generateStaticParams() {
  const schools = await prisma.school.findMany();
  return schools.map(c => ({
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
  const school = await getSchool(params.id, {
    includes: parseInclusion(request, ["educations"]) as SchoolIncludes,
    visibility,
  });
  if (!school) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK(school).response;
}
