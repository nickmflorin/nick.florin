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
  const skills = await prisma.skill.findMany({
    where: {
      experiences: { some: { experienceId: { in: experiences.map(e => e.id) } } },
    },
    include: { experiences: true },
  });
  const data: ApiExperience[] = experiences.map(e => ({
    ...e,
    details: details.filter(d => d.entityId === e.id),
    skills: skills.filter(s => s.experiences.some(ex => ex.experienceId === e.id)),
  }));
  return ClientResponse.OK(data).toResponse();
}
