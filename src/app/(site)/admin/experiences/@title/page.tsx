import { Suspense } from 'react';

import { ExperiencesFiltersObj } from '~/actions';

import { LoadingText } from '~/components/loading/LoadingText';

import { ExperiencesTitle } from './ExperiencesTitle';

export interface ExperiencesTitlePageProps {
  readonly searchParams: Promise<Record<string, string>>;
}

const ExperiencesTitlePage = async (props: ExperiencesTitlePageProps) => {
  const searchParams = await props.searchParams;
  const filters = ExperiencesFiltersObj.parse(searchParams);
  return (
    <Suspense fallback={<LoadingText />} key={JSON.stringify(filters)}>
      <ExperiencesTitle filters={filters} />
    </Suspense>
  );
};

export default ExperiencesTitlePage;
