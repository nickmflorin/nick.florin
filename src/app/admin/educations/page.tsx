import { z } from "zod";

import { decodeQueryParam } from "~/lib/urls";
import { EducationsTableView } from "~/components/tables/EducationsTableView";

interface EducationsPageProps {
  readonly searchParams: {
    readonly search?: string;
    readonly page?: string;
    readonly checkedRows?: string;
  };
}

export default async function EducationsPage({
  searchParams: { search, checkedRows, page: _page },
}: EducationsPageProps) {
  /* Even if the 'page' query parameter is very large, the action to fetch the data will eventually
     truncate it based on the maximum possible page size - so we do not need to worry about
     sanitizing here. */
  const parsed = z.coerce.number().min(1).int().default(1).safeParse(_page);
  let page: number = 1;
  if (parsed.success) {
    page = parsed.data;
  }

  const filters = {
    search: search ?? "",
  };

  return (
    <EducationsTableView
      filters={filters}
      page={page}
      checkedRows={
        checkedRows ? decodeQueryParam(checkedRows, { form: ["array"] as const }) ?? [] : []
      }
    />
  );
}
