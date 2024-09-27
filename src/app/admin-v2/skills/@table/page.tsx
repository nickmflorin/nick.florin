import { Suspense } from "react";

import { z } from "zod";

import { parseOrdering } from "~/lib/ordering";

import { SkillsDefaultOrdering, SkillsFiltersObj } from "~/actions-v2";

import { Loading } from "~/components/loading/Loading";
import { columnIsOrderable } from "~/components/tables-v2";
import { SkillsTableColumns } from "~/features/skills";
import { SkillsTableControlBarPlaceholder } from "~/features/skills/components/tables-v2/SkillsTableControlBarPlaceholder";

import { SkillsTableBody } from "./SkillsTableBody";

export interface SkillsTablePageProps {
  readonly searchParams: Record<string, string>;
}

export default async function SkillsTablePage({ searchParams }: SkillsTablePageProps) {
  const page = z.coerce.number().int().positive().min(1).safeParse(searchParams?.page).data ?? 1;

  const filters = SkillsFiltersObj.parse(searchParams);

  const ordering = parseOrdering(searchParams, {
    defaultOrdering: SkillsDefaultOrdering,
    fields: SkillsTableColumns.filter(c => columnIsOrderable(c)).map(c => c.id),
  });

  return (
    <Suspense
      key={JSON.stringify(filters) + JSON.stringify(ordering) + JSON.stringify(page)}
      fallback={
        <>
          <SkillsTableControlBarPlaceholder />
          <Loading isLoading component="tbody" />
        </>
      }
    >
      <SkillsTableBody filters={filters} page={page} ordering={ordering} />
    </Suspense>
  );
}
