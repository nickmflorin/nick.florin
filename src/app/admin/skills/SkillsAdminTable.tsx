import dynamic from "next/dynamic";
import { cache } from "react";

import { prisma } from "~/prisma/client";
import { constructOrSearch, includeSkillMetadata } from "~/prisma/query";
import { Loading } from "~/components/views/Loading";

const SkillsTable = dynamic(() => import("~/components/tables/SkillsAdminTable/index"), {
  loading: () => <Loading loading={true} />,
});

interface SkillsRoutedTableProps {
  readonly search: string | undefined;
}

const getTableData = cache(async (search: string | undefined) => {
  const _skills = await prisma.skill.findMany({
    where: { AND: constructOrSearch(search, ["slug", "label"]) },
    orderBy: { createdAt: "desc" },
  });
  const experiences = await prisma.experience.findMany({
    include: { company: true },
    orderBy: { startDate: "desc" },
  });
  const educations = await prisma.education.findMany({
    include: { school: true },
    orderBy: { startDate: "desc" },
  });
  return { skills: await includeSkillMetadata(_skills), experiences, educations };
});

export default async function SkillsRoutedTable({ search }: SkillsRoutedTableProps) {
  const { skills, experiences, educations } = await getTableData(search);
  return <SkillsTable skills={skills} experiences={experiences} educations={educations} />;
}