import { ClientResponse } from "~/application/http";
import { prisma } from "~/prisma/client";
import { type ApiExperience, DetailEntityType } from "~/prisma/model";

export async function GET() {
  const experiences = await prisma.experience.findMany({
    include: { company: true },
    orderBy: { startDate: "desc" },
  });
  const details = await prisma.detail.findMany({
    where: {
      entityType: DetailEntityType.EXPERIENCE,
      entityId: { in: experiences.map(e => e.id) },
    },
  });
  const data: ApiExperience[] = experiences.map(e => ({
    ...e,
    details: details.filter(d => d.entityId === e.id),
  }));
  return ClientResponse.OK(data).toResponse();
}
