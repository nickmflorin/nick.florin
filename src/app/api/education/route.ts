import { type NextRequest } from "next/server";

import { ClientResponse } from "~/application/http";
import { prisma } from "~/prisma/client";

export async function GET(request: NextRequest) {
  const educations = await prisma.education.findMany({
    include: { school: true },
    orderBy: { startDate: "desc" },
  });
  return ClientResponse.OK(educations).toResponse();
}
