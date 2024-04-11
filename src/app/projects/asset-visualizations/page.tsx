import { prisma } from "~/prisma/client";
import { convertToPlainObject } from "~/api/serialization";
import { AssetVisualizations } from "~/components/projects/AssetVisualizations";

export default async function AssetVisualizationsPage() {
  const project = convertToPlainObject(
    await prisma.project.findUniqueOrThrow({
      where: { slug: "asset-visualizations" },
      include: { repositories: true, skills: true },
    }),
  );
  return <AssetVisualizations project={project} />;
}
