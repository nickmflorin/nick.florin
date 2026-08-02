import { type JSX, Suspense } from 'react';

import { fetchRepositories } from '~/actions/repositories/fetch-repositories';
import { fetchSkills } from '~/actions/skills/fetch-skills';

import { ProjectsTableFilterBar as ClientProjectsTableFilterBar } from '~/features/projects/components/tables/ProjectsTableFilterBar';

const getSkills = async () => {
  const skillsFetcher = fetchSkills([]);
  const { data: skills } = await skillsFetcher(
    { filters: {}, visibility: 'admin' },
    { strict: true },
  );

  return skills;
};

const getRepositories = async () => {
  const repositoriesFetcher = fetchRepositories([]);
  const { data: repositories } = await repositoriesFetcher(
    { filters: {}, visibility: 'admin' },
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
