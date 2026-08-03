import { Suspense } from 'react';

import { SkillsFiltersObj } from '~/actions';

import { LoadingText } from '~/components/loading/LoadingText';

import { SkillsTitle } from './SkillsTitle';

export interface SkillsTitlePageProps {
  readonly searchParams: Promise<Record<string, string>>;
}

const SkillsTitlePage = async (props: SkillsTitlePageProps) => {
  const searchParams = await props.searchParams;
  const filters = SkillsFiltersObj.parse(searchParams);
  return (
    <Suspense fallback={<LoadingText />} key={JSON.stringify(filters)}>
      <SkillsTitle filters={filters} />
    </Suspense>
  );
};

export default SkillsTitlePage;
