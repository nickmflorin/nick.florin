import { z } from "zod";

import { partiallyParseObjectWithSchema } from "~/lib/schemas";
import { decodeQueryParams } from "~/lib/urls";
import { RepositoriesTableView } from "~/components/tables/views/RepositoriesTableView";

const RepositoriesPageFiltersSchema = z.object({
  search: z.string(),
});

interface RepositoriesPageProps {
  readonly searchParams: Record<string, string>;
}

export default async function RepositoriesPage({ searchParams }: RepositoriesPageProps) {
  const { filters: _filters, page: _page } = decodeQueryParams(searchParams);
  /* Note: In the case that the 'page' query parameter is very large (and thus, invalid), the action
     to fetch the data will eventually truncate/clamp the value based on the maximum possible page
     size - so we do not need to worry about sanitizing here. */
  const parsed = z.coerce.number().min(1).int().default(1).safeParse(_page);
  let page: number = 1;
  if (parsed.success) {
    page = parsed.data;
  }
  const filters = partiallyParseObjectWithSchema(_filters, RepositoriesPageFiltersSchema, {
    logWhenInvalid: true,
    defaults: {
      search: "",
    },
  });

  return <RepositoriesTableView filters={filters} page={page} />;
}
