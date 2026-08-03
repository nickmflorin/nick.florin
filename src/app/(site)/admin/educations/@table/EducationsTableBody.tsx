import dynamic from 'next/dynamic';
import { type JSX } from 'react';

import { type EducationsControls, type EducationsFilters } from '~/actions';
import { fetchEducations } from '~/actions/educations/fetch-educations';

import { Loading } from '~/components/loading/Loading';
import { EducationsTableControlBarPlaceholder } from '~/features/educations/components/tables/EducationsTableControlBarPlaceholder';

const ClientEducationsTableBody = dynamic(
  () =>
    import('~/features/educations/components/tables/EducationsTableBody').then(
      mod => mod.EducationsTableBody,
    ),
  {
    loading: () => (
      <>
        <EducationsTableControlBarPlaceholder />
        <Loading component='tbody' isLoading />
      </>
    ),
  },
);

const getEducations = async ({
  filters,
  ordering,
  page,
}: {
  readonly filters: EducationsFilters;
  readonly ordering: EducationsControls['ordering'];
  readonly page: number;
}) => {
  const fetcher = fetchEducations(['skills', 'details']);
  const { data: educations } = await fetcher(
    {
      filters,
      ordering,
      page,
      visibility: 'admin',
    },
    { strict: true },
  );
  return educations;
};

export interface EducationsTableBodyProps {
  readonly filters: EducationsFilters;
  readonly ordering: EducationsControls['ordering'];
  readonly page: number;
}

export const EducationsTableBody = async ({
  filters,
  ordering,
  page,
}: EducationsTableBodyProps): Promise<JSX.Element> => {
  const educations = await getEducations({ filters, ordering, page });
  return <ClientEducationsTableBody data={educations} />;
};
