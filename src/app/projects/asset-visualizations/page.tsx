import { prisma } from "~/prisma/client";
import { AssetVisualizations } from "~/components/projects/AssetVisualizations";

export default async function AssetVisualizationsPage() {
  const project = await prisma.project.findUniqueOrThrow({
    where: { slug: "asset-visualizations" },
    include: { repositories: true },
  });
  const skills = await prisma.skill.findMany({
    where: { projects: { some: { projectId: project.id } } },
  });
  return <AssetVisualizations project={{ ...project, skills }} />;
}
