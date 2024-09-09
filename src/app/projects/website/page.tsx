import { prisma } from "~/prisma/client";

import { convertToPlainObject } from "~/api/serialization";

import { Website } from "~/components/projects/Website";

export default async function WebsitePage() {
  const project = convertToPlainObject(
    await prisma.project.findUniqueOrThrow({
      where: { slug: "website" },
      include: { repositories: true, skills: true },
    }),
  );
  return <Website project={project} />;
}
