import { Suspense } from "react";

import { z } from "zod";

import { parseOrdering } from "~/lib/ordering";

import { RepositoriesDefaultOrdering, RepositoriesFiltersObj } from "~/actions-v2";

import { Loading } from "~/components/loading/Loading";
import { columnIsOrderable } from "~/components/tables-v2";
import { RepositoriesTableColumns } from "~/features/repositories";
import { RepositoriesTableControlBarPlaceholder } from "~/features/repositories/components/tables-v2/RepositoriesTableControlBarPlaceholder";

import { RepositoriesTableBody } from "./RepositoriesTableBody";

export interface RepositoriesTablePageProps {
  readonly searchParams: Record<string, string>;
}

export default async function RepositoriesTablePage({ searchParams }: RepositoriesTablePageProps) {
  const page = z.coerce.number().int().positive().min(1).safeParse(searchParams?.page).data ?? 1;

  const filters = RepositoriesFiltersObj.parse(searchParams);

  const ordering = parseOrdering(searchParams, {
    defaultOrdering: RepositoriesDefaultOrdering,
    fields: RepositoriesTableColumns.filter(c => columnIsOrderable(c)).map(c => c.id),
  });

  return (
    <Suspense
      key={JSON.stringify(filters) + JSON.stringify(ordering) + JSON.stringify(page)}
      fallback={
        <>
          <RepositoriesTableControlBarPlaceholder />
          <Loading isLoading component="tbody" />
        </>
      }
    >
      <RepositoriesTableBody filters={filters} page={page} ordering={ordering} />
    </Suspense>
  );
}
