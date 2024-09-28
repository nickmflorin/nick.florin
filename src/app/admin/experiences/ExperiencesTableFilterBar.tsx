import { Suspense } from "react";

import { getCompanies as fetchCompanies } from "~/actions/fetches/companies";
import { fetchSkills } from "~/actions-v2/skills/fetch-skills";

import { ExperiencesTableFilterBar as ClientExperiencesTableFilterBar } from "~/features/experiences/components/tables/ExperiencesTableFilterBar";

const getSkills = async () => {
  const skillsFetcher = fetchSkills([]);
  const { data: skills } = await skillsFetcher(
    { visibility: "admin", filters: {} },
    { strict: true },
  );

  return skills;
};

const getCompanies = async () => await fetchCompanies({ visibility: "admin", includes: [] });

export const ExperiencesTableFilterBar = async (): Promise<JSX.Element> => {
  const [skills, companies] = await Promise.all([getSkills(), getCompanies()]);

  return (
    <Suspense>
      <ClientExperiencesTableFilterBar companies={companies} skills={skills} />
    </Suspense>
  );
};
