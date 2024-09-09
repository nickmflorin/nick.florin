import { redirect } from "next/navigation";

import { prisma } from "~/prisma/client";

import { convertToPlainObject } from "~/api/serialization";

import { GreenBudget } from "~/components/projects/GreenBudget";

export default async function GreenBudgetPage() {
  const project = convertToPlainObject(
    await prisma.project.findUniqueOrThrow({
      where: { slug: "greenbudget" },
      include: { repositories: true, skills: true },
    }),
  );
  if (!project.visible) {
    return redirect("/404");
  }
  return <GreenBudget project={project} />;
}
