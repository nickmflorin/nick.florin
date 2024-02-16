import dynamic from "next/dynamic";

import { Loading } from "~/components/views/Loading";
import { prisma } from "~/prisma/client";
import { includeSkillMetadata } from "~/prisma/query";

const SkillsTable = dynamic(() => import("~/components/tables/SkillsAdminTable/index"), {
  loading: () => <Loading loading={true} />,
});

export default async function SkillsRoutedTable() {
  const _skills = await prisma.skill.findMany({ orderBy: { createdAt: "desc" } });
  const experiences = await prisma.experience.findMany({
    include: { company: true },
    orderBy: { startDate: "desc" },
  });
  const educations = await prisma.education.findMany({
    include: { school: true },
    orderBy: { startDate: "desc" },
  });
  const skills = await includeSkillMetadata(_skills);
  return <SkillsTable skills={skills} experiences={experiences} educations={educations} />;
}
