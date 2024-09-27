import { Suspense } from "react";

import { fetchRepositories } from "~/actions-v2/repositories/fetch-repositories";
import { fetchSkills } from "~/actions-v2/skills/fetch-skills";

import { ProjectsTableFilterBar as ClientProjectsTableFilterBar } from "~/features/projects/components/tables-v2/ProjectsTableFilterBar";

const getSkills = async () => {
  const skillsFetcher = fetchSkills([]);
  const { data: skills } = await skillsFetcher(
    { visibility: "admin", filters: {} },
    { strict: true },
  );

  return skills;
};

const getRepositories = async () => {
  const repositoriesFetcher = fetchRepositories([]);
  const { data: repositories } = await repositoriesFetcher(
    { visibility: "admin", filters: {} },
    { strict: true },
  );
  return repositories;
};

export const ProjectsTableFilterBar = async (): Promise<JSX.Element> => {
  const [skills, repositories] = await Promise.all([getSkills(), getRepositories()]);

  return (
    <Suspense>
      <ClientProjectsTableFilterBar repositories={repositories} skills={skills} />
    </Suspense>
  );
};
