import { Suspense } from "react";

import { z } from "zod";

import { parseOrdering } from "~/lib/ordering";

import { EducationsDefaultOrdering, EducationsFiltersObj } from "~/actions-v2";

import { Loading } from "~/components/loading/Loading";
import { columnIsOrderable } from "~/components/tables";
import { EducationsTableColumns } from "~/features/educations";
import { EducationsTableControlBarPlaceholder } from "~/features/educations/components/tables/EducationsTableControlBarPlaceholder";

import { EducationsTableBody } from "./EducationsTableBody";

export interface EducationsTablePageProps {
  readonly searchParams: Record<string, string>;
}

export default async function EducationsTablePage({ searchParams }: EducationsTablePageProps) {
  const page = z.coerce.number().int().positive().min(1).safeParse(searchParams?.page).data ?? 1;

  const filters = EducationsFiltersObj.parse(searchParams);

  const ordering = parseOrdering(searchParams, {
    defaultOrdering: EducationsDefaultOrdering,
    fields: EducationsTableColumns.filter(c => columnIsOrderable(c)).map(c => c.id),
  });

  return (
    <Suspense
      key={JSON.stringify(filters) + JSON.stringify(ordering) + JSON.stringify(page)}
      fallback={
        <>
          <EducationsTableControlBarPlaceholder />
          <Loading isLoading component="tbody" />
        </>
      }
    >
      <EducationsTableBody filters={filters} page={page} ordering={ordering} />
    </Suspense>
  );
}
