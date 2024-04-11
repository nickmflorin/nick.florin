import { type NextRequest } from "next/server";

import { getAuthUserFromRequest } from "~/application/auth";
import { prisma } from "~/prisma/client";
import { type EducationIncludes } from "~/prisma/model";
import { getEducation } from "~/actions/fetches/educations";
import { ClientResponse, ApiClientGlobalError } from "~/api";
import { parseInclusion, parseVisibility } from "~/api/query";

export async function generateStaticParams() {
  const educations = await prisma.education.findMany();
  return educations.map(e => ({
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
  const education = await getEducation(params.id, {
    includes: parseInclusion(request, ["details", "skills", "courses"]) as EducationIncludes,
    visibility,
  });
  if (!education) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK(education).response;
}
