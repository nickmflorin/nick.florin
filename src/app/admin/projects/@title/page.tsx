import { Suspense } from 'react';

import { ProjectsFiltersObj } from '~/actions';

import { LoadingText } from '~/components/loading/LoadingText';

import { ProjectsTitle } from './ProjectsTitle';

export interface ProjectsTitlePageProps {
  readonly searchParams: Promise<Record<string, string>>;
}

const ProjectsTitlePage = async (props: ProjectsTitlePageProps) => {
  const searchParams = await props.searchParams;
  const filters = ProjectsFiltersObj.parse(searchParams);
  return (
    <Suspense fallback={<LoadingText />} key={JSON.stringify(filters)}>
      <ProjectsTitle filters={filters} />
    </Suspense>
  );
};

export default ProjectsTitlePage;
