import { Suspense } from "react";

import { z } from "zod";

import { parseOrdering } from "~/lib/ordering";

import { ExperiencesDefaultOrdering, ExperiencesFiltersObj } from "~/actions-v2";

import { Loading } from "~/components/loading/Loading";
import { columnIsOrderable } from "~/components/tables-v2";
import { ExperiencesTableColumns } from "~/features/experiences";
import { ExperiencesTableControlBarPlaceholder } from "~/features/experiences/components/tables-v2/ExperiencesTableControlBarPlaceholder";

import { ExperiencesTableBody } from "./ExperiencesTableBody";

export interface ExperiencesTablePageProps {
  readonly searchParams: Record<string, string>;
}

export default async function ExperiencesTablePage({ searchParams }: ExperiencesTablePageProps) {
  const page = z.coerce.number().int().positive().min(1).safeParse(searchParams?.page).data ?? 1;

  const filters = ExperiencesFiltersObj.parse(searchParams);

  const ordering = parseOrdering(searchParams, {
    defaultOrdering: ExperiencesDefaultOrdering,
    fields: ExperiencesTableColumns.filter(c => columnIsOrderable(c)).map(c => c.id),
  });

  return (
    <Suspense
      key={JSON.stringify(filters) + JSON.stringify(ordering) + JSON.stringify(page)}
      fallback={
        <>
          <ExperiencesTableControlBarPlaceholder />
          <Loading isLoading component="tbody" />
        </>
      }
    >
      <ExperiencesTableBody filters={filters} page={page} ordering={ordering} />
    </Suspense>
  );
}
