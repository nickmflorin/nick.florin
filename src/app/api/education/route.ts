import { type NextRequest } from "next/server";

import { ServerResponse } from "~/application/response";
import { prisma } from "~/prisma/client";

export async function GET(request: NextRequest) {
  const educations = await prisma.education.findMany({
    include: { school: true },
    orderBy: { startDate: "desc" },
  });
  return ServerResponse.OK(educations).toResponse();
}
