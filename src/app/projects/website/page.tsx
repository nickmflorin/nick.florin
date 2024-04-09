import { prisma } from "~/prisma/client";
import { Website } from "~/components/projects/Website";

export default async function WebsitePage() {
  const project = await prisma.project.findUniqueOrThrow({
    where: { slug: "website" },
    include: { repositories: true },
  });
  const skills = await prisma.skill.findMany({
    where: { projects: { some: { projectId: project.id } } },
  });
  return <Website project={{ ...project, skills }} />;
}
