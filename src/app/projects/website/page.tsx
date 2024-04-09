import { prisma } from "~/prisma/client";
import { convertToPlainObject } from "~/actions/fetches/serialization";
import { Website } from "~/components/projects/Website";

export default async function WebsitePage() {
  const project = convertToPlainObject(
    await prisma.project.findUniqueOrThrow({
      where: { slug: "website" },
      include: { repositories: true },
    }),
  );
  const skills = (
    await prisma.skill.findMany({
      where: { projects: { some: { projectId: project.id } } },
    })
  ).map(convertToPlainObject);
  return <Website project={{ ...project, skills }} />;
}
