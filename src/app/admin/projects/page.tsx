import { z } from "zod";

import { partiallyParseObjectWithSchema } from "~/lib/schemas";
import { decodeQueryParams } from "~/lib/urls";

import { ProjectsTableView } from "~/features/projects/components/tables/ProjectsTableView";

const ProjectsPageFiltersSchema = z.object({
  search: z.string(),
});

interface ProjectsPageProps {
  readonly searchParams: Record<string, string>;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { filters: _filters, page: _page } = decodeQueryParams(searchParams);
  /* Note: In the case that the 'page' query parameter is very large (and thus, invalid), the action
     to fetch the data will eventually truncate/clamp the value based on the maximum possible page
     size - so we do not need to worry about sanitizing here. */
  const parsed = z.coerce.number().min(1).int().default(1).safeParse(_page);
  let page: number = 1;
  if (parsed.success) {
    page = parsed.data;
  }
  const filters = partiallyParseObjectWithSchema(_filters, ProjectsPageFiltersSchema, {
    logWhenInvalid: true,
    defaults: {
      search: "",
    },
  });

  return <ProjectsTableView filters={filters} page={page} />;
}
