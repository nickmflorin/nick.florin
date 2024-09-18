import { prisma } from "~/database/prisma";

import { convertToPlainObject } from "~/api/serialization";

import { ToolTrack } from "~/features/projects/components/pages/ToolTrack";

import { RedirectIfNotVisible } from "../RedirectIfNotVisible";

export default async function ToolTrackPage() {
  const project = convertToPlainObject(
    await prisma.project.findUniqueOrThrow({
      where: { slug: "tooltrack" },
      include: { repositories: true, skills: true },
    }),
  );

  return (
    <RedirectIfNotVisible project={project}>
      <ToolTrack project={project} />
    </RedirectIfNotVisible>
  );
}
