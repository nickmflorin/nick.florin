import { prisma } from "~/prisma/client";
import { convertToPlainObject } from "~/actions/fetches/serialization";
import { AssetVisualizations } from "~/components/projects/AssetVisualizations";

export default async function AssetVisualizationsPage() {
  const project = convertToPlainObject(
    await prisma.project.findUniqueOrThrow({
      where: { slug: "asset-visualizations" },
      include: { repositories: true },
    }),
  );
  const skills = (
    await prisma.skill.findMany({
      where: { projects: { some: { projectId: project.id } } },
    })
  ).map(convertToPlainObject);
  return <AssetVisualizations project={{ ...project, skills }} />;
}
