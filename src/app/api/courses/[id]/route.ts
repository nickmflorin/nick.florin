import { type NextRequest } from "next/server";

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
  const includes = parseInclusion(request, ["education", "skills"]) as CourseIncludes;
  const visibility = parseVisibility(request);

  const course = await getCourse(params.id, { includes, visibility });
  if (!course) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK(course).response;
}
