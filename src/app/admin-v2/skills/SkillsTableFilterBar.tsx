import { Suspense } from "react";

import { fetchEducations } from "~/actions-v2/educations/fetch-educations";
import { fetchExperiences } from "~/actions-v2/experiences/fetch-experiences";
import { fetchProjects } from "~/actions-v2/projects/fetch-projects";
import { fetchRepositories } from "~/actions-v2/repositories/fetch-repositories";

import { SkillsTableFilterBar as ClientSkillsTableFilterBar } from "~/features/skills/components/tables-v2/SkillsTableFilterBar";

const getEducations = async () => {
  const eduFetcher = fetchEducations([]);
  const { data: educations } = await eduFetcher(
    { visibility: "admin", filters: {} },
    { strict: true },
  );
  return educations;
};

const getExperiences = async () => {
  const expFetcher = fetchExperiences([]);
  const { data: experiences } = await expFetcher(
    { visibility: "admin", filters: {} },
    { strict: true },
  );
  return experiences;
};

const getProjects = async () => {
  const projFetcher = fetchProjects([]);
  const { data: projects } = await projFetcher(
    { visibility: "admin", filters: {} },
    { strict: true },
  );
  return projects;
};

const getRepositories = async () => {
  const repositoriesFetcher = fetchRepositories([]);
  const { data: repositories } = await repositoriesFetcher(
    { visibility: "admin", filters: {} },
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
        repositories={repositories}
        projects={projects}
      />
    </Suspense>
  );
};
