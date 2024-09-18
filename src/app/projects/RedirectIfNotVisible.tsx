import { redirect } from "next/navigation";
import { type ReactNode } from "react";

import { sortBy } from "lodash-es";

import { logger } from "~/internal/logger";
import { prisma } from "~/database/prisma";
import type { Project, ProjectSlug } from "~/database/model";
import { ProjectSlugs } from "~/database/model";

export interface RedirectIfNotVisibleProps {
  readonly children: ReactNode;
  readonly project: Project;
}

export const RedirectIfNotVisible = async ({ project, children }: RedirectIfNotVisibleProps) => {
  if (!project.visible) {
    // If the project is not visible, we want to dynamically redirect to a visible project.
    const otherProjects = await prisma.project.findMany({
      where: { id: { notIn: [project.id] }, visible: true },
    });

    const slugs = otherProjects.reduce((acc, proj) => {
      if (ProjectSlugs.contains(proj.slug)) {
        return [...acc, proj.slug];
      }
      logger.warn(
        `Encountered a project '${proj.slug}' stored in the database without a corresponding ` +
          "hard-coded slug.",
        { slug: proj.slug },
      );
      return acc;
    }, [] as ProjectSlug[]);

    /* Order the projects by their respective locations in the ProjectSlugs hard-coded set.  This
       ordering will be consistent with the ordering of the tabs on the Projects page, which will
       allow us to redirect to the first tab associated with a project that is visible. */
    const ordered = sortBy(slugs, slug => {
      const slugIndex = [...ProjectSlugs.members].indexOf(slug);
      if (slugIndex === -1) {
        throw new Error(
          `Could not find slug '${slug}' in ProjectSlugs even though they were all already ` +
            "verified to exist!",
        );
      }
      return slugIndex;
    });
    if (ordered.length === 0) {
      return redirect("/404");
    }
    return redirect(`/projects/${ordered[0]}`);
  }
  return <>{children}</>;
};
