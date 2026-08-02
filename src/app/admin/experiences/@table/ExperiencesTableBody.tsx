import dynamic from 'next/dynamic';
import { type JSX } from 'react';

import { type ExperiencesControls, type ExperiencesFilters } from '~/actions';
import { fetchExperiences } from '~/actions/experiences/fetch-experiences';

import { Loading } from '~/components/loading/Loading';
import { ExperiencesTableControlBarPlaceholder } from '~/features/experiences/components/tables/ExperiencesTableControlBarPlaceholder';

const ClientExperiencesTableBody = dynamic(
  () =>
    import('~/features/experiences/components/tables/ExperiencesTableBody').then(
      mod => mod.ExperiencesTableBody,
    ),
  {
    loading: () => (
      <>
        <ExperiencesTableControlBarPlaceholder />
        <Loading component='tbody' isLoading />
      </>
    ),
  },
);

const getExperiences = async ({
  filters,
  ordering,
  page,
}: {
  readonly filters: ExperiencesFilters;
  readonly ordering: ExperiencesControls['ordering'];
  readonly page: number;
}) => {
  const fetcher = fetchExperiences(['skills', 'details']);
  const { data: experiences } = await fetcher(
    {
      filters,
      ordering,
      page,
      visibility: 'admin',
    },
    { strict: true },
  );
  return experiences;
};

export interface ExperiencesTableBodyProps {
  readonly filters: ExperiencesFilters;
  readonly ordering: ExperiencesControls['ordering'];
  readonly page: number;
}

export const ExperiencesTableBody = async ({
  filters,
  ordering,
  page,
}: ExperiencesTableBodyProps): Promise<JSX.Element> => {
  const experiences = await getExperiences({ filters, ordering, page });
  return <ClientExperiencesTableBody data={experiences} />;
};
