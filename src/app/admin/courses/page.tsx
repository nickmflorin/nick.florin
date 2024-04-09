import { z } from "zod";

import { CoursesTableView } from "~/components/tables/views/CoursesTableView";

interface CoursesPageProps {
  readonly searchParams: {
    readonly search?: string;
    readonly page?: string;
  };
}

export default async function CoursesPage({
  searchParams: { search, page: _page },
}: CoursesPageProps) {
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

  return <CoursesTableView filters={filters} page={page} />;
}
