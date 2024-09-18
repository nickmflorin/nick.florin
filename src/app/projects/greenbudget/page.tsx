import { prisma } from "~/database/prisma";

import { convertToPlainObject } from "~/api/serialization";

import { GreenBudget } from "~/features/projects/components/pages/GreenBudget";

import { RedirectIfNotVisible } from "../RedirectIfNotVisible";

export default async function GreenBudgetPage() {
  const project = convertToPlainObject(
    await prisma.project.findUniqueOrThrow({
      where: { slug: "greenbudget" },
      include: { repositories: true, skills: true },
    }),
  );
  return (
    <RedirectIfNotVisible project={project}>
      <GreenBudget project={project} />
    </RedirectIfNotVisible>
  );
}
