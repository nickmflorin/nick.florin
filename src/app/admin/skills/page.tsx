import { z } from "zod";

import { partiallyParseObjectWithSchema } from "~/lib/schemas";
import { isUuid } from "~/lib/typeguards";
import { decodeQueryParams } from "~/lib/urls";
import { SkillsTableView } from "~/components/tables/views/SkillsTableView";

const SkillsPageFiltersSchema = z.object({
  search: z.string(),
  educations: z.array(z.string()).transform(value => value.filter(v => isUuid(v))),
  experiences: z.array(z.string()).transform(value => value.filter(v => isUuid(v))),
});

interface SkillsPageProps {
  readonly searchParams: Record<string, string>;
}

export default async function SkillsPage({ searchParams }: SkillsPageProps) {
  const { filters: _filters, page: _page } = decodeQueryParams(searchParams);
  /* Note: In the case that the 'page' query parameter is very large (and thus, invalid), the action
     to fetch the data will eventually truncate/clamp the value based on the maximum possible page
     size - so we do not need to worry about sanitizing here. */
  const parsed = z.coerce.number().min(1).int().default(1).safeParse(_page);
  let page: number = 1;
  if (parsed.success) {
    page = parsed.data;
  }
  const filters = partiallyParseObjectWithSchema(_filters, SkillsPageFiltersSchema, {
    logWhenInvalid: true,
    defaults: {
      search: "",
      educations: [],
      experiences: [],
    },
  });
  return <SkillsTableView filters={filters} page={page} />;
}
