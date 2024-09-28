import { Suspense } from "react";

import { fetchProjects } from "~/actions-v2/projects/fetch-projects";
import { fetchSkills } from "~/actions-v2/skills/fetch-skills";

import { RepositoriesTableFilterBar as ClientRepositoriesTableFilterBar } from "~/features/repositories/components/tables/RepositoriesTableFilterBar";

const getSkills = async () => {
  const skillsFetcher = fetchSkills([]);
  const { data: skills } = await skillsFetcher(
    { visibility: "admin", filters: {} },
    { strict: true },
  );

  return skills;
};

const getProjects = async () => {
  const projectsFetcher = fetchProjects([]);
  const { data: projects } = await projectsFetcher(
    { visibility: "admin", filters: {} },
    { strict: true },
  );
  return projects;
};

export const RepositoriesTableFilterBar = async (): Promise<JSX.Element> => {
  const [skills, projects] = await Promise.all([getSkills(), getProjects()]);

  return (
    <Suspense>
      <ClientRepositoriesTableFilterBar projects={projects} skills={skills} />
    </Suspense>
  );
};
