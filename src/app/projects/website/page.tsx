import { prisma } from "~/prisma/client";

import { convertToPlainObject } from "~/api/serialization";

import { Website } from "~/features/projects/components/pages/Website";

import { RedirectIfNotVisible } from "../RedirectIfNotVisible";

export default async function WebsitePage() {
  const project = convertToPlainObject(
    await prisma.project.findUniqueOrThrow({
      where: { slug: "website" },
      include: { repositories: true, skills: true },
    }),
  );

  return (
    <RedirectIfNotVisible project={project}>
      <Website project={project} />
    </RedirectIfNotVisible>
  );
}
