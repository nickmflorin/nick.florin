import { z } from "zod";

import { partiallyParseObjectWithSchema } from "~/lib/schemas";
import { decodeQueryParams } from "~/lib/urls";
import { EducationsTableView } from "~/components/tables/views/EducationsTableView";

const EducationsPageFiltersSchema = z.object({
  search: z.string(),
});

interface EducationsPageProps {
  readonly searchParams: Record<string, string>;
}

export default async function EducationsPage({ searchParams }: EducationsPageProps) {
  const { filters: _filters, page: _page } = decodeQueryParams(searchParams);
  /* Note: In the case that the 'page' query parameter is very large (and thus, invalid), the action
     to fetch the data will eventually truncate/clamp the value based on the maximum possible page
     size - so we do not need to worry about sanitizing here. */
  const parsed = z.coerce.number().min(1).int().default(1).safeParse(_page);
  let page: number = 1;
  if (parsed.success) {
    page = parsed.data;
  }
  const filters = partiallyParseObjectWithSchema(_filters, EducationsPageFiltersSchema, {
    logWhenInvalid: true,
    defaults: {
      search: "",
    },
  });

  return <EducationsTableView filters={filters} page={page} />;
}
