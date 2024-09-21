import { getEducations } from "~/actions/fetches/educations";
import { getExperiences } from "~/actions/fetches/experiences";
import { type SkillsFilters } from "~/actions-v2";

import { SkillsTableFilterBar as ClientSkillsTableFilterBar } from "~/features/skills/components/tables-v2/SkillsTableFilterBar";

export interface SkillsTableFilterBarProps {
  readonly filters: SkillsFilters;
}

export const SkillsTableFilterBar = async ({
  filters,
}: SkillsTableFilterBarProps): Promise<JSX.Element> => {
  const educations = await getEducations({ filters, visibility: "admin", includes: [] });
  const experiences = await getExperiences({ filters, visibility: "admin", includes: [] });
  return (
    <ClientSkillsTableFilterBar
      filters={filters}
      educations={educations}
      experiences={experiences}
    />
  );
};
