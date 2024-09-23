import { getEducations } from "~/actions/fetches/educations";
import { getExperiences } from "~/actions/fetches/experiences";
import { getProjects } from "~/actions/fetches/projects";
import { getRepositories } from "~/actions/fetches/repositories";
import { type SkillsFilters } from "~/actions-v2";

import { SkillsTableFilterBar as ClientSkillsTableFilterBar } from "~/features/skills/components/tables-v2/SkillsTableFilterBar";

export interface SkillsTableFilterBarProps {
  readonly filters: SkillsFilters;
}

export const SkillsTableFilterBar = async ({
  filters,
}: SkillsTableFilterBarProps): Promise<JSX.Element> => {
  const educations = await getEducations({ visibility: "admin", includes: [] });
  const experiences = await getExperiences({ visibility: "admin", includes: [] });
  const projects = await getProjects({ visibility: "admin", includes: [] });
  const repositories = await getRepositories({ visibility: "admin", includes: [] });
  return (
    <ClientSkillsTableFilterBar
      filters={filters}
      educations={educations}
      experiences={experiences}
      repositories={repositories}
      projects={projects}
    />
  );
};
