import dynamic from "next/dynamic";
import { cache } from "react";

import { z } from "zod";

import { prisma } from "~/prisma/client";
import { includeSkillMetadata } from "~/prisma/model";
import { constructOrSearch } from "~/prisma/util";
import { getEducations } from "~/fetches/get-educations";
import { getExperiences } from "~/fetches/get-experiences";
import { Loading } from "~/components/views/Loading";

const SkillsTable = dynamic(() => import("~/components/tables/SkillsAdminTable/index"), {
  loading: () => <Loading loading={true} />,
});

const PAGE_SIZE = 16;

interface SkillsAdminTableProps {
  readonly search: string | undefined;
  readonly page: string | undefined;
}

const getTableData = cache(
  async (
    { search, page }: { search: string | undefined; page: number },
    {
      experiences,
      educations,
    }: {
      experiences: Awaited<ReturnType<typeof getExperiences<{ skills: true }>>>;
      educations: Awaited<ReturnType<typeof getEducations<{ skills: true }>>>;
    },
  ) => {
    const _skills = await prisma.skill.findMany({
      where: { AND: constructOrSearch(search, ["slug", "label"]) },
      orderBy: { createdAt: "desc" },
      skip: PAGE_SIZE * (page - 1),
      take: PAGE_SIZE,
    });
    return await includeSkillMetadata(_skills, { educations, experiences });
  },
);

export const SkillsAdminTable = async ({ search, page }: SkillsAdminTableProps) => {
  const educations = await getEducations({ skills: true });
  const experiences = await getExperiences({ skills: true });

  /* We might want to look into setting a maximum here so that we don't wind up with empty results
     when the page is too large. */
  const pg = z.coerce.number().min(1).int().default(1).parse(page);
  const skills = await getTableData({ page: pg, search }, { experiences, educations });
  return <SkillsTable skills={skills} experiences={experiences} educations={educations} />;
};
