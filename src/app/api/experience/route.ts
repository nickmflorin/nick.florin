import { type NextRequest } from "next/server";

import { ServerResponse } from "~/application/response";
import { prisma } from "~/prisma/client";

export async function GET(request: NextRequest) {
  const experiences = await prisma.experience.findMany({
    include: { company: true },
    orderBy: { startDate: "desc" },
  });
  return ServerResponse.OK(experiences).toResponse();
}
