import dynamic from "next/dynamic";
import { Suspense, cache } from "react";

import { prisma } from "~/prisma/client";
import { includeSkillMetadata } from "~/prisma/model";
import { constructOrSearch } from "~/prisma/util";
import { Loading } from "~/components/views/Loading";

const SkillsTable = dynamic(() => import("~/components/tables/SkillsAdminTable/index"), {
  loading: () => <Loading loading={true} />,
});

const getTableData = async (search: string | undefined) => {
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
};

interface SkillsPageProps {
  readonly searchParams: { readonly search?: string };
}

export default async function SkillsLayout({ searchParams: { search } }: SkillsPageProps) {
  const { skills, experiences, educations } = await getTableData(search);
  return (
    /* Wrapped in Suspense because the table accesses useSearchParams.
       Note: We should revisit this, it may no longer be necessary because the table is at the top
       level of this "page" and the "page" is wrapped in a suspense boundary by default. */
    <Suspense key={search} fallback={<Loading loading={true} />}>
      <SkillsTable skills={skills} experiences={experiences} educations={educations} />
    </Suspense>
  );
}
