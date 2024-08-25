import { prisma } from "~/prisma/client";
import { convertToPlainObject } from "~/api/serialization";
import { ToolTrack } from "~/components/projects/ToolTrack";

export default async function ToolTrackPage() {
  const project = convertToPlainObject(
    await prisma.project.findUniqueOrThrow({
      where: { slug: "tooltrack" },
      include: { repositories: true, skills: true },
    }),
  );
  return <ToolTrack project={project} />;
}
