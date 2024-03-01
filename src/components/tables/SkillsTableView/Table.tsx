import dynamic from "next/dynamic";

import { includeSkillMetadata } from "~/prisma/model";
import { getAdminEducations } from "~/actions/fetches/get-educations";
import { getAdminExperiences } from "~/actions/fetches/get-experiences";
import { getSkills } from "~/actions/fetches/get-skills";
import { Loading } from "~/components/views/Loading";

import { type Filters } from "./types";

const ClientTable = dynamic(() => import("./ClientSkillsTable"), {
  loading: () => <Loading loading={true} />,
});

interface SkillsAdminTableProps {
  readonly page: number;
  readonly filters: Filters;
}

export const SkillsAdminTable = async ({ page, filters }: SkillsAdminTableProps) => {
  const educationsData = await getAdminEducations({ page, filters });
  const experiences = await getAdminExperiences({ page, filters });
  const educationIds = educationsData.map(e => e.id);
  const _skills = await getSkills({
    page,
    filters: {
      ...filters,
      educations: filters.educations.filter(e => educationIds.includes(e)),
    },
  });
  const skills = await includeSkillMetadata(_skills, { educations: educationsData, experiences });
  return <ClientTable skills={skills} experiences={experiences} educations={educationsData} />;
};
