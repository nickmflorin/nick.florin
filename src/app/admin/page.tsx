import dynamic from "next/dynamic";

import { TextInput } from "~/components/input/TextInput";
import { prisma } from "~/prisma/client";
import { includeSkillMetadata } from "~/prisma/query";

const SkillsTable = dynamic(() => import("~/components/tables/SkillsAdminTable/index"), {
  loading: () => <>Loading...</>,
  ssr: false,
});

export default async function Admin() {
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
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <TextInput />
      <SkillsTable skills={skills} experiences={experiences} educations={educations} />
    </div>
  );
}
