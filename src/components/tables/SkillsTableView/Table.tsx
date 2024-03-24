import dynamic from "next/dynamic";

import { includeSkillMetadata } from "~/prisma/model";
import { getAdminEducations } from "~/actions/fetches/get-educations";
import { getAdminExperiences } from "~/actions/fetches/get-experiences";
import { getSkills } from "~/actions/fetches/get-skills";
import { Loading } from "~/components/views/Loading";

import { type Filters } from "./types";

const ContextTable = dynamic(() => import("../ContextTable"), {
  loading: () => <Loading loading={true} />,
});

interface SkillsAdminTableProps {
  readonly page: number;
  readonly filters: Filters;
}

export const SkillsAdminTable = async ({ page, filters }: SkillsAdminTableProps) => {
  const educationsData = await getAdminEducations({ page, filters });
  const experiencesData = await getAdminExperiences({ page, filters });

  const _skills = await getSkills({
    page,
    filters: {
      ...filters,
      educations: filters.educations.filter(e => educationsData.map(e => e.id).includes(e)),
      experiences: filters.experiences.filter(e => experiencesData.map(e => e.id).includes(e)),
    },
  });
  const skills = await includeSkillMetadata(_skills, {
    educations: educationsData,
    experiences: experiencesData,
  });
  return <ContextTable data={skills} />;
};
