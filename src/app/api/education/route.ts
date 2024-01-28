import { ClientResponse } from "~/application/http";
import { prisma } from "~/prisma/client";
import { type ApiEducation, DetailEntityType } from "~/prisma/model";

export async function GET() {
  const educations = await prisma.education.findMany({
    include: { school: true },
    orderBy: { startDate: "desc" },
  });
  const details = await prisma.detail.findMany({
    where: {
      entityType: DetailEntityType.EDUCATION,
      entityId: { in: educations.map(e => e.id) },
    },
  });
  const data: ApiEducation[] = educations.map(e => ({
    ...e,
    details: details.filter(d => d.entityId === e.id),
  }));
  return ClientResponse.OK(data).toResponse();
}
