import dynamic from "next/dynamic";

import { includeSkillMetadata } from "~/prisma/model";
import { getEducations } from "~/actions/fetches/get-educations";
import { getExperiences } from "~/actions/fetches/get-experiences";
import { getSkills } from "~/actions/fetches/get-skills";
import { Loading } from "~/components/views/Loading";

import { type Filters } from "./types";

const SkillsTable = dynamic(() => import("./ClientSkillsAdminTable"), {
  loading: () => <Loading loading={true} />,
});

interface SkillsAdminTableProps {
  readonly page: number;
  readonly filters: Filters;
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
