import { Suspense } from "react";

import { fetchCompanies } from "~/actions-v2/companies/fetch-companies";
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

const getCompanies = async () => {
  const companiesFetcher = fetchCompanies([]);
  const { data: companies } = await companiesFetcher(
    { visibility: "admin", filters: {} },
    { strict: true },
  );

  return companies;
};

export const ExperiencesTableFilterBar = async (): Promise<JSX.Element> => {
  const [skills, companies] = await Promise.all([getSkills(), getCompanies()]);

  return (
    <Suspense>
      <ClientExperiencesTableFilterBar companies={companies} skills={skills} />
    </Suspense>
  );
};
