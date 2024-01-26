import { type NextRequest } from "next/server";

import { ClientResponse } from "~/application/http";
import { prisma } from "~/prisma/client";

export async function GET(request: NextRequest) {
  const experiences = await prisma.experience.findMany({
    include: { company: true },
    orderBy: { startDate: "desc" },
  });
  return ClientResponse.OK(experiences).toResponse();
}
