import { type NextRequest } from "next/server";

import { getAuthUserFromRequest } from "~/application/auth";
import { prisma } from "~/prisma/client";
import { type CourseIncludes } from "~/prisma/model";
import { getCourse } from "~/actions/fetches/courses";
import { ClientResponse, ApiClientGlobalError } from "~/api";
import { parseInclusion, parseVisibility } from "~/api/query";

export async function generateStaticParams() {
  const courses = await prisma.course.findMany();
  return courses.map(c => ({
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
  const course = await getCourse(params.id, {
    includes: parseInclusion(request, ["education", "skills"]) as CourseIncludes,
    visibility,
  });
  if (!course) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK(course).response;
}
