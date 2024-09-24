import { getCompanies } from "~/actions/fetches/companies";
import { type ExperiencesFilters } from "~/actions-v2";
import { fetchSkills } from "~/actions-v2/skills/fetch-skills";

import { ExperiencesTableFilterBar as ClientExperiencesTableFilterBar } from "~/features/experiences/components/tables-v2/ExperiencesTableFilterBar";

export interface ExperiencesTableFilterBarProps {
  readonly filters: ExperiencesFilters;
}

export const ExperiencesTableFilterBar = async ({
  filters,
}: ExperiencesTableFilterBarProps): Promise<JSX.Element> => {
  const fetcher = fetchSkills([]);
  const { data: skills } = await fetcher({ visibility: "admin", filters: {} }, { strict: true });
  const companies = await getCompanies({ visibility: "admin", includes: [] });

  return (
    <ClientExperiencesTableFilterBar filters={filters} companies={companies} skills={skills} />
  );
};
