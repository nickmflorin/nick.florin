import { type JSX, Suspense } from 'react';

import { fetchEducations } from '~/actions/educations/fetch-educations';
import { fetchExperiences } from '~/actions/experiences/fetch-experiences';
import { fetchProjects } from '~/actions/projects/fetch-projects';
import { fetchRepositories } from '~/actions/repositories/fetch-repositories';

import { SkillsTableFilterBar as ClientSkillsTableFilterBar } from '~/features/skills/components/tables/SkillsTableFilterBar';

const getEducations = async () => {
  const eduFetcher = fetchEducations([]);
  const { data: educations } = await eduFetcher(
    { filters: {}, visibility: 'admin' },
    { strict: true },
  );
  return educations;
};

const getExperiences = async () => {
  const expFetcher = fetchExperiences([]);
  const { data: experiences } = await expFetcher(
    { filters: {}, visibility: 'admin' },
    { strict: true },
  );
  return experiences;
};

const getProjects = async () => {
  const projFetcher = fetchProjects([]);
  const { data: projects } = await projFetcher(
    { filters: {}, visibility: 'admin' },
    { strict: true },
  );
  return projects;
};

const getRepositories = async () => {
  const repositoriesFetcher = fetchRepositories([]);
  const { data: repositories } = await repositoriesFetcher(
    { filters: {}, visibility: 'admin' },
    { strict: true },
  );
  return repositories;
};

export const SkillsTableFilterBar = async (): Promise<JSX.Element> => {
  const [educations, experiences, projects, repositories] = await Promise.all([
    getEducations(),
    getExperiences(),
    getProjects(),
    getRepositories(),
  ]);
  return (
    <Suspense>
      <ClientSkillsTableFilterBar
        educations={educations}
        experiences={experiences}
        projects={projects}
        repositories={repositories}
      />
    </Suspense>
  );
};
