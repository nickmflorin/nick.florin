import { Suspense } from 'react';

import { z } from 'zod';

import { parseOrdering } from '~/lib/ordering';

import { SkillsDefaultOrdering, SkillsFiltersObj } from '~/actions';

import { Loading } from '~/components/loading/Loading';
import { columnIsOrderable } from '~/components/tables';
import { SkillsTableColumns } from '~/features/skills';
import { SkillsTableControlBarPlaceholder } from '~/features/skills/components/tables/SkillsTableControlBarPlaceholder';

import { SkillsTableBody } from './SkillsTableBody';

export interface SkillsTablePageProps {
  readonly searchParams: Promise<Record<string, string>>;
}

const SkillsTablePage = async (props: SkillsTablePageProps) => {
  const searchParams = await props.searchParams;
  const page = z.coerce.number().int().positive().min(1).safeParse(searchParams.page).data ?? 1;

  const filters = SkillsFiltersObj.parse(searchParams);

  const ordering = parseOrdering(searchParams, {
    defaultOrdering: SkillsDefaultOrdering,
    fields: SkillsTableColumns.filter(c => columnIsOrderable(c)).map(c => c.id),
  });

  return (
    <Suspense
      fallback={
        <>
          <SkillsTableControlBarPlaceholder />
          <Loading component='tbody' isLoading />
        </>
      }
      key={JSON.stringify(filters) + JSON.stringify(ordering) + JSON.stringify(page)}
    >
      <SkillsTableBody filters={filters} ordering={ordering} page={page} />
    </Suspense>
  );
};

export default SkillsTablePage;
