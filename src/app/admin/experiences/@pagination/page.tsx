import type { JSX } from "react";

import { z } from "zod";

import { ExperiencesFiltersObj } from "~/actions";
import { fetchExperiencesPagination } from "~/actions/experiences/fetch-experiences";

import { Paginator } from "~/components/pagination-v2/Paginator";

export interface ExperiencesTablePaginationPageProps {
  readonly searchParams: Promise<Record<string, string>>;
}

export default async function ExperiencesTablePaginationPage(
  props: ExperiencesTablePaginationPageProps,
): Promise<JSX.Element> {
  const searchParams = await props.searchParams;
  const _page = z.coerce.number().int().positive().min(1).safeParse(searchParams?.page).data ?? 1;

  const filters = ExperiencesFiltersObj.parse(searchParams);

  const {
    data: { count, page, pageSize },
  } = await fetchExperiencesPagination(
    { filters, page: _page, visibility: "admin" },
    { strict: true },
  );

  return <Paginator count={count} pageSize={pageSize} page={page} />;
}
