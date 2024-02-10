import dynamic from "next/dynamic";

import { TextInput } from "~/components/input/TextInput";
import { prisma } from "~/prisma/client";

const SkillsTable = dynamic(() => import("~/components/tables/SkillsTable"), {
  loading: () => <>Loading...</>,
});

export default async function Admin() {
  const skills = await prisma.skill.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <TextInput />
      <SkillsTable skills={skills} />
    </div>
  );
}
