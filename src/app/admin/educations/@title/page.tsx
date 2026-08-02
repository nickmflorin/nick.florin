import { Suspense } from 'react';

import { EducationsFiltersObj } from '~/actions';

import { LoadingText } from '~/components/loading/LoadingText';

import { EducationsTitle } from './EducationsTitle';

export interface EducationsTitlePageProps {
  readonly searchParams: Promise<Record<string, string>>;
}

const EducationsTitlePage = async (props: EducationsTitlePageProps) => {
  const searchParams = await props.searchParams;
  const filters = EducationsFiltersObj.parse(searchParams);
  return (
    <Suspense fallback={<LoadingText />} key={JSON.stringify(filters)}>
      <EducationsTitle filters={filters} />
    </Suspense>
  );
};

export default EducationsTitlePage;
