import dynamic from "next/dynamic";
import { cache, Suspense } from "react";

import { prisma } from "~/prisma/client";
import { includeSkillMetadata } from "~/prisma/model";
import { constructOrSearch } from "~/prisma/util";
import { getEducations } from "~/fetches/get-educations";
import { getExperiences } from "~/fetches/get-experiences";
import { Loading } from "~/components/views/Loading";

const SkillsTable = dynamic(() => import("~/components/tables/SkillsAdminTable/index"), {
  loading: () => <Loading loading={true} />,
});

interface SkillsRoutedTableProps {
  readonly search: string | undefined;
}

const getTableData = async (search: string | undefined) => {
  const _skills = await prisma.skill.findMany({
    where: { AND: constructOrSearch(search, ["slug", "label"]) },
    orderBy: { createdAt: "desc" },
  });
  return await includeSkillMetadata(_skills);
};

export default async function SkillsAdminTable({ search }: SkillsRoutedTableProps) {
  const educations = await getEducations({});
  const experiences = await getExperiences({});
  const skills = await getTableData(search);
  console.log("RENDERING");
  return (
    // Wrapped in Suspense because the table accesses useSearchParams.
    <Suspense fallback={<Loading loading={true} />}>
      <SkillsTable skills={skills} experiences={experiences} educations={educations} />
    </Suspense>
  );
}
