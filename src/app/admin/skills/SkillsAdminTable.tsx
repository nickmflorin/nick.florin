import dynamic from "next/dynamic";

import { includeSkillMetadata } from "~/prisma/model";
import { getEducations } from "~/fetches/get-educations";
import { getExperiences } from "~/fetches/get-experiences";
import { Loading } from "~/components/views/Loading";

import { getSkills } from "./getSkills";
import { type SkillsTableFilters } from "./types";

const SkillsTable = dynamic(() => import("~/components/tables/SkillsAdminTable/index"), {
  loading: () => <Loading loading={true} />,
});

interface SkillsAdminTableProps {
  readonly page: number;
  readonly filters: SkillsTableFilters;
}

export const SkillsAdminTable = async ({ page, filters }: SkillsAdminTableProps) => {
  const educationsData = await getEducations({ skills: true });
  const experiences = await getExperiences({ skills: true });
  const educationIds = educationsData.map(e => e.id);
  const _skills = await getSkills({
    page,
    filters: {
      ...filters,
      educations: filters.educations.filter(e => educationIds.includes(e)),
    },
  });
  const skills = await includeSkillMetadata(_skills, { educations: educationsData, experiences });
  return <SkillsTable skills={skills} experiences={experiences} educations={educationsData} />;
};
