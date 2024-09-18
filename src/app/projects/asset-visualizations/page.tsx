import { prisma } from "~/database/prisma";

import { convertToPlainObject } from "~/api/serialization";

import { AssetVisualizations } from "~/features/projects/components/pages/AssetVisualizations";

import { RedirectIfNotVisible } from "../RedirectIfNotVisible";

export default async function AssetVisualizationsPage() {
  const project = convertToPlainObject(
    await prisma.project.findUniqueOrThrow({
      where: { slug: "asset-visualizations" },
      include: { repositories: true, skills: true },
    }),
  );
  return (
    <RedirectIfNotVisible project={project}>
      <AssetVisualizations project={project} />
    </RedirectIfNotVisible>
  );
}
