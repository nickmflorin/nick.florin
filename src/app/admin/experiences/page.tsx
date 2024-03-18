import { Suspense } from "react";

import { z } from "zod";

import { decodeQueryParam } from "~/lib/urls";
import { ExperiencesTableView } from "~/components/tables/ExperiencesTableView";
import { Loading } from "~/components/views/Loading";

import { Drawers } from "./Drawers";

interface ExperiencesPageProps {
  readonly searchParams: {
    readonly search?: string;
    readonly page?: string;
  };
}

export default async function ExperiencesPage({
  searchParams: { search, page: _page },
}: ExperiencesPageProps) {
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
    <>
      <ExperiencesTableView filters={filters} page={page} />
      <Suspense fallback={<Loading loading={true} />}>
        <Drawers />
      </Suspense>
    </>
  );
}
