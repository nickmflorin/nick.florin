import { logger } from "~/application/logger";
import type { LabeledNavItem } from "~/application/pages";
import { humanizeList } from "~/lib/formatters";
import { ProjectSlugs } from "~/prisma/model";

import { getProjects } from "~/actions/fetches/projects";

import { Tabs } from "~/components/layout/Tabs";
import { classNames } from "~/components/types";

interface AdminLayoutProps {
  readonly children: React.ReactNode;
}

/* TODO: We should consider - at least eventually - populating the tabs based on the projects in the
   database. */
export default async function ProjectsLayout({ children }: AdminLayoutProps): Promise<JSX.Element> {
  /* We want to include all projects, regardless of visibility, so we can determine whether or not
     a log should be issued if a project is not in the database if the slug is hard-coded.  If
     the project is in the database, but is just not visible, we do not want to issue warnings if
     the slug does not exist in the returned set of projects. */
  const projects = await getProjects({ visibility: "admin", includes: [] });

  /* Issue a log warning if there are any projects that do not have a corresponding hard-coded slug
     in the code. */
  const missingProjs = projects.filter(project => !ProjectSlugs.contains(project.slug));
  if (missingProjs.length !== 0) {
    const missingSlugs = missingProjs.map(project => project.slug);
    const humanized = humanizeList(missingSlugs, { conjunction: "and", formatter: v => `'${v}'` });
    logger.warn(
      `Encountered project(s) stored in the database without a corresponding hard-coded slug: ${humanized}.`,
      { slugs: missingSlugs },
    );
  }

  /* Loop over the hard-coded project slugs so that we can ensure the projects shown in the nav
     are in the proper order (based on the enumerated literals definition of ProjectSlugs). */
  const items = [...ProjectSlugs.members].reduce(
    (acc: LabeledNavItem[], slug): LabeledNavItem[] => {
      const proj = projects.find(project => project.slug === slug);
      if (proj === undefined) {
        logger.error(
          `Encountered a hard-coded project slug, '${slug}', that does not have a corresponding ` +
            "project in the database.",
          { slug },
        );
        return acc;
      } else if (proj.visible === false) {
        return acc;
      }
      return [
        ...acc,
        {
          label: proj.shortName ?? proj.name,
          path: `/projects/${slug}`,
          activePaths: { leadingPath: `/projects/${slug}` },
          icon: { name: ProjectSlugs.getModel(slug).icon },
        },
      ];
    },
    [] as LabeledNavItem[],
  );

  return (
    <div className="flex flex-col gap-[24px] w-full h-full overflow-hidden max-sm:overflow-y-auto">
      <Tabs items={items} />
      <div
        className={classNames(
          "grow max-h-full h-full overflow-y-auto flex flex-col max-sm:overflow-y-visible",
        )}
      >
        {children}
      </div>
    </div>
  );
}
