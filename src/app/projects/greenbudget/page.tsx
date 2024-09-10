import { prisma } from "~/prisma/client";

import { convertToPlainObject } from "~/api/serialization";

import { GreenBudget } from "~/components/projects/GreenBudget";

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
